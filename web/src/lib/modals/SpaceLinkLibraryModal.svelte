<script lang="ts">
  import { getMoveFolders, linkLibrary } from '@immich/sdk';
  import { FormModal } from '@immich/ui';
  import { handleError } from '$lib/utils/handle-error';
  import { t } from 'svelte-i18n';

  type Props = {
    spaceId: string;
    onClose: (linkedCount?: number) => void;
  };

  let { spaceId, onClose }: Props = $props();

  let currentPath = $state('/');
  let parentPath = $state('/');
  let folders = $state<string[]>([]);
  let externalLibraries = $state<Array<{ name: string; path: string }>>([]);
  let selectedPath = $state('');
  let pending = $state(false);

  const browse = async (path: string) => {
    pending = true;
    try {
      const result = await getMoveFolders({ assetMoveFoldersDto: { path } });
      currentPath = result.path;
      parentPath = result.parentPath;
      folders = result.folders;
      externalLibraries = result.externalLibraries;
    } catch (error) {
      handleError(error, $t('spaces_linked_libraries_error_load'));
    } finally {
      pending = false;
    }
  };

  $effect(() => {
    void browse('/');
  });

  const onSubmit = async () => {
    if (!selectedPath || pending) return;
    pending = true;
    try {
      await linkLibrary({ id: spaceId, sharedSpaceLibraryLinkDto: { importPath: selectedPath } });
      onClose(1);
    } catch (error) {
      handleError(error, $t('spaces_linked_libraries_error_link'));
      pending = false;
    }
  };
</script>

<FormModal
  size="small"
  title={$t('spaces_linked_libraries_link_library')}
  submitText={$t('link')}
  cancelText={$t('cancel')}
  disabled={!selectedPath || pending}
  {onSubmit}
  {onClose}
>
  <div class="my-4 flex flex-col gap-2">
    <label>{$t('destination_folder')}</label>
    <div class="immich-form-input truncate">{currentPath}</div>
    <button
      class="text-left text-sm underline"
      type="button"
      onclick={() => void browse(parentPath)}
      disabled={pending || parentPath === currentPath}
    >
      ↑ {$t('up_one_level')}
    </button>
    {#if externalLibraries.length > 0}
      <h3 class="mt-2 text-sm font-medium">{$t('external_libraries')}</h3>
      <div class="max-h-32 overflow-y-auto rounded border border-immich-primary/20">
        {#each externalLibraries as library (library.path)}
          <button
            class="block w-full truncate px-3 py-2 text-left hover:bg-immich-primary/10"
            type="button"
            onclick={() => void browse(library.path)}
            disabled={pending}
          >
            📚 {library.name} · {library.path}
          </button>
        {/each}
      </div>
    {/if}
    <h3 class="mt-2 text-sm font-medium">{$t('folders')}</h3>
    <div class="max-h-48 overflow-y-auto rounded border border-immich-primary/20">
      {#each folders as folder (folder)}
        <button
          class="block w-full truncate px-3 py-2 text-left hover:bg-immich-primary/10"
          type="button"
          onclick={() => void browse(folder)}
          disabled={pending}
        >
          📁 {folder.split(/[\\/]/).at(-1)}
        </button>
      {:else}
        <p class="p-3 text-sm text-immich-fg/60">{$t('no_subfolders')}</p>
      {/each}
    </div>
    <button
      class="rounded bg-immich-primary/10 px-3 py-2"
      type="button"
      onclick={() => (selectedPath = currentPath)}
      disabled={pending}
    >
      {$t('choose_folder')}
    </button>
    {#if selectedPath}
      <p class="truncate text-sm">{$t('selected_folder')}: {selectedPath}</p>
    {/if}
  </div>
</FormModal>
