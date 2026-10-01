<script lang="ts">
  import { Field, FormModal, Input } from '@immich/ui';
  import { mdiFolderPlusOutline } from '@mdi/js';
  import { t } from 'svelte-i18n';

  type Props = {
    title: string;
    label?: string;
    /** Pre-filled when renaming; empty when creating. */
    initialName?: string;
    onClose: (name?: string) => void;
  };

  const { title, label = $t('space_album_folder_name_label'), initialName = '', onClose }: Props = $props();

  let value = $state(initialName);

  // Trim here as well as on the server: it keeps "  " from arriving as a submittable name,
  // and the server re-validates regardless.
  const onSubmit = () => {
    const name = value.trim();
    onClose(name || undefined);
  };
</script>

<FormModal {title} icon={mdiFolderPlusOutline} {onClose} {onSubmit} size="small" submitText={$t('save')}>
  <Field {label}>
    <Input bind:value />
  </Field>
</FormModal>
