import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import type * as DialogPrimitive from '@radix-ui/react-dialog';
import { FolderPlusIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

import { AppError, AppErrorCode } from '@documenso/lib/errors/app-error';
import { FolderType } from '@documenso/lib/types/folder-type';
import { formatTemplatesPath } from '@documenso/lib/utils/teams';
import { trpc } from '@documenso/trpc/react';
import { Button } from '@documenso/ui/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@documenso/ui/primitives/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@documenso/ui/primitives/form/form';
import { Input } from '@documenso/ui/primitives/input';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { useOptionalCurrentTeam } from '~/providers/team';

const ZCreateFolderFormSchema = z.object({
  name: z.string().min(1, { message: 'Folder name is required' }),
});

type TCreateFolderFormSchema = z.infer<typeof ZCreateFolderFormSchema>;

export type TemplateFolderCreateDialogProps = {
  trigger?: React.ReactNode;
} & Omit<DialogPrimitive.DialogProps, 'children'>;

export const TemplateFolderCreateDialog = ({
  trigger,
  ...props
}: TemplateFolderCreateDialogProps) => {
  const { toast } = useToast();
  const { _ } = useLingui();
  const navigate = useNavigate();
  const team = useOptionalCurrentTeam();
  const { folderId } = useParams();

  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);

  const { mutateAsync: createFolder } = trpc.folder.createFolder.useMutation();

  const form = useForm<TCreateFolderFormSchema>({
    resolver: zodResolver(ZCreateFolderFormSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = async (data: TCreateFolderFormSchema) => {
    try {
      const newFolder = await createFolder({
        name: data.name,
        parentId: folderId,
        type: FolderType.TEMPLATE,
      });

      setIsCreateFolderOpen(false);

      toast({
        description: _(msg`Folder created successfully`),
      });

      const templatesPath = formatTemplatesPath(team?.url);

      void navigate(`${templatesPath}/f/${newFolder.id}`);
    } catch (err) {
      const error = AppError.parseError(err);

      if (error.code === AppErrorCode.ALREADY_EXISTS) {
        toast({
          title: _(msg`Erreur lors de la création du dossier`),
          description: _(msg`Ce nom de dossier est déjà pris.`),
          variant: 'destructive',
        });

        return;
      }

      toast({
        title: _(msg`Erreur lors de la création du dossier`),
        description: _(msg`Une erreur inconnue est survenue lors de la création du dossier.`),
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (!isCreateFolderOpen) {
      form.reset();
    }
  }, [isCreateFolderOpen, form]);

  return (
    <Dialog {...props} open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="flex items-center space-x-2">
            <FolderPlusIcon className="h-4 w-4" />
            <span>Créer un dossier</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un nouveau dossier</DialogTitle>
          <DialogDescription>
            Entrez un nom pour votre nouveau dossier. Les dossiers vous aident à organiser vos
            templates.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du dossier</FormLabel>
                  <FormControl>
                    <Input placeholder="Mon dossier" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsCreateFolderOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit">Créer</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
