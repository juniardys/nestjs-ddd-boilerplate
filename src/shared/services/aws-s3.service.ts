import { basename, join, normalize } from 'path';
import * as fs from 'fs';
import https from 'https';

import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as mime from 'mime-types';
import { v4 as uuidv4 } from 'uuid';

import { IFile } from '../../interfaces/IFile';
import { SettingService } from './setting.service';
import { GeneratorService } from './generator.service';

@Injectable()
export class AwsS3Service {
  private readonly _s3: AWS.S3;
  private readonly _config: SettingService;

  constructor(
    public settingService: SettingService,
    public generatorService: GeneratorService,
  ) {
    const options: AWS.S3.Types.ClientConfiguration = {
      apiVersion: '2010-12-01',
      region: 'eu-central-1', // TODO: update those settingS
    };

    const awsS3Config = settingService.awsS3Config;
    if (awsS3Config.accessKeyId && awsS3Config.secretAccessKey) {
      options.credentials = awsS3Config;
    }

    // eslint-disable-next-line import/namespace
    this._s3 = new AWS.S3(options);
    this._config = settingService;
  }

  async uploadImage(file: IFile, folder?: string) {
    const fileName = this.generatorService.fileName(
      mime.extension(file.mimetype) as string,
    );
    const key = 'images/' + (folder ? `${folder}/` : '') + fileName;
    await this._s3
      .putObject({
        Bucket: this.settingService.awsS3Config.bucketName,
        Body: file.buffer,
        Key: key,
      })
      .promise();

    return key;
  }

  getAssetsS3Public(pathLocation: string): string {
    if (
      pathLocation === null ||
      pathLocation === undefined ||
      pathLocation.match(/^(http|https):\/\//i)
    ) {
      return pathLocation || null;
    }

    const url = `${this._config.awsS3Config.publicUrl}/${pathLocation}`;
    const cleanUrl = url.replace(/([^:]\/)\/+/g, '$1');
    return cleanUrl;
  }

  async imageLinkToS3(source, cloudDir, roots = 'upload/tmp') {
    let failed = false;

    const result: IFile = {
      encoding: '',
      buffer: undefined,
      fieldname: '',
      mimetype: '',
      originalname: '',
      size: 0,
    };

    return await new Promise<void>((resolve) => {
      if (!source) {
        Object.assign(result, { source });
        resolve();
      }

      const name = uuidv4();
      let target = normalize(join(roots, name));

      let extension = basename(source).split('.').pop();

      const softReject = (error) => {
        Object.assign(result, { error, source, target });
        failed = true;
        resolve();
      };

      https
        .get(source)
        .on('error', softReject)
        .on('response', (response) => {
          const mime = response.headers['content-type'];
          extension = mime.split('/').pop();
          result.mimetype = mime;
        })
        .pipe(fs.createWriteStream(target))
        .on('finish', () => {
          if (extension) {
            const full = `${target}.${extension}`;
            fs.renameSync(target, full);
            target = full;
            const file = fs.readFileSync(full);
            result.buffer = file;
          }
          Object.assign(result, { source, target });
          resolve();
        });
    }).then(async () => {
      // s3 upload
      if (!failed) {
        try {
          const data = await this.uploadImage(
            result,
            this._config.awsS3Config.defaultLinkImageSavedPath,
          );
          return data;
        } catch (error) {
          return null;
        }
      }
    });
  }
}
