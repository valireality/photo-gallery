<script lang="ts">
  import { createMoveFolder, getMoveFolders, moveAssets } from '@immich/sdk';
  import { FormModal } from '@immich/ui';
  import { handleError } from '$lib/utils/handle-error';
  import { t } from 'svelte-i18n';

  type Props = { assetIds: string[]; onClose: (moved?: boolean) => void };
  let { assetIds, onClose }: Props = $props();
  let destinationFolder = $state('');
  let folders = $state<string[]>([]);
  let currentPath = $state('/');
  let parentPath = $state('/');
  let newFolderName = $state('');
  let pending = $state(false);

  const browse = async (path: string) => {
    pending = true;
    try {
      const result = await getMoveFolders({ assetMoveFoldersDto: { path } });
      currentPath = result.path;
      parentPath = result.parentPath;
      folders = result.folders;
    } catch (error) {
      handleError(error, $t('move_assets_error'));
    } finally {
      pending = false;
    }
  };

  $effect(() => { void browse('/'); });

  const onCreateFolder = async () => {
    if (!currentPath || !newFolderName.trim()) return;
    pending = true;
    try {
      await createMoveFolder({ assetMoveFolderCreateDto: { parentFolder: currentPath, name: newFolderName.trim() } });
      newFolderName = '';
      await browse(currentPath);
    } catch (error) {
      handleError(error, $t('move_assets_error'));
    } finally {
      pending = false;
    }
  };

  const onSubmit = async () => {
    if (!destinationFolder.trim() || pending) {
      return;
    }
    pending = true;
    try {
      await moveAssets({ assetMoveDto: { assetIds, destinationFolder: destinationFolder.trim() } });
      onClose(true);
    } catch (error) {
      handleError(error, $t('move_assets_error'));
    } finally {
      pending = false;
    }
  };
</script>

<FormModal
  size="small"
  title={$t('move_to_folder')}
  {onClose}
  {onSubmit}
  submitText={$t('move')}
  disabled={!destinationFolder.trim() || pending}
>
  <div class="my-4 flex flex-col gap-2">
    <label for="destination-folder">{$t('destination_folder')}</label>
    <div class="immich-form-input truncate" id="destination-folder">{currentPath}</div>
    <button class="text-left text-sm underline" type="button" onclick={() => browse(parentPath)} disabled={pending || parentPath === currentPath}>↑ {$t('up_one_level')}</button>
    <div class="max-h-48 overflow-y-auto rounded border border-immich-primary/20">
      {#each folders as folder}
        <button class="block w-full truncate px-3 py-2 text-left hover:bg-immich-primary/10" type="button" onclick={() => browse(folder)} disabled={pending}>📁 {folder.split(/[\\/]/).at(-1)}</button>
      {:else}
        <p class="p-3 text-sm text-immich-fg/60">{$t('no_subfolders')}</p>
      {/each}
    </div>
    <button class="rounded bg-immich-primary/10 px-3 py-2" type="button" onclick={() => destinationFolder = currentPath}>{$t('choose_folder')}</button>
    {#if destinationFolder}<p class="truncate text-sm">{$t('selected_folder')}: {destinationFolder}</p>{/if}
    <div class="flex gap-2">
    <input
      class="immich-form-input"
      bind:value={newFolderName}
      placeholder={$t('new_folder_name')}
      autocomplete="off"
      spellcheck="false"
    />
    <button class="immich-form a-button" type="button" onclick={onCreateFolder} disabled={!newFolderName.trim() || pending}>{$t('create')}</button>
    </div>
    <p class="text-sm text-immich-fg/60">{$t('move_assets_description', { values: { count: assetIds.length } })}</p>
  </div>
</FormModal>
