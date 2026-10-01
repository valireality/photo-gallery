import { Injectable } from '@nestjs/common';
import { AssetResponseDto, mapAsset } from 'src/dtos/asset-response.dto';
import { AuthDto } from 'src/dtos/auth.dto';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class ViewService extends BaseService {
  async getUniqueOriginalPaths(auth: AuthDto): Promise<string[]> {
    const memberships = await this.sharedSpaceRepository.getSpaceIdsForMember(auth.user.id);
    return this.viewRepository.getUniqueOriginalPaths(auth.user.id, undefined, memberships.map(({ spaceId }) => spaceId));
  }

  async getAssetsByOriginalPath(auth: AuthDto, path: string): Promise<AssetResponseDto[]> {
    const memberships = await this.sharedSpaceRepository.getSpaceIdsForMember(auth.user.id);
    const assets = await this.viewRepository.getAssetsByOriginalPath(auth.user.id, path, undefined, memberships.map(({ spaceId }) => spaceId));
    return assets.map((asset) => mapAsset(asset, { auth }));
  }
}
