import type { ForgeConfig } from '@electron-forge/shared-types';
import path from 'node:path';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { PublisherGithub } from '@electron-forge/publisher-github';
import * as fs from 'fs-extra';

const config: ForgeConfig = {
  rebuildConfig: {},
  packagerConfig: {
    asar: true,
    icon: path.resolve(__dirname, 'assets', 'icon'),
    extraResource: ['resources', 'assets'],
    appCategoryType: 'public.app-category.utilities',
    executableName: 'StarMesh',
  },
  hooks: {
    postMake: async (_config, makeResults) => {
      const isPrerelease = process.env.PRE_RELEASE === 'true';
      const betaVersion = process.env.BETA_VERSION;

      if (isPrerelease) {
        const packageJson = await fs.readJson(path.resolve(__dirname, 'package.json'));
        const version = packageJson.version;

        for (const makeResult of makeResults) {
          const newArtifacts: string[] = [];

          for (const artifactPath of makeResult.artifacts) {
            const dir = path.dirname(artifactPath);
            const ext = path.extname(artifactPath);
            const name = path.basename(artifactPath, ext);

            const newName = name.replace(new RegExp(`[-_]${version.replace(/\./g, '\\.')}(?=[-_]|$)`, 'i'), (match) => {
              const separator = match[0] || '-';
              return `${separator}${version}${separator}beta.${betaVersion ?? 0}`;
            });
            const newPath = path.join(dir, `${newName}${ext}`);

            if (artifactPath !== newPath && (await fs.pathExists(artifactPath))) {
              await fs.move(artifactPath, newPath);
              newArtifacts.push(newPath);
            } else {
              newArtifacts.push(artifactPath);
            }
          }

          makeResult.artifacts = newArtifacts;
        }
      }

      return makeResults;
    },
  },
  makers: [
    new MakerDMG({
      format: 'ULFO',
      icon: 'assets/icon.icns',
      background: 'assets/background.png',
      contents: (opts) => [
        { x: 142, y: 245, type: 'file', path: opts.appPath },
        { x: 488, y: 245, type: 'link', path: '/Applications' },
      ],
      additionalDMGOptions: {
        window: { size: { width: 658, height: 498 } },
      },
    }),
    new MakerSquirrel({ iconUrl: 'assets/icon.ico' }),
    new MakerRpm({
      options: {
        bin: 'StarMesh',
        icon: 'assets/icon.png',
        categories: ['Network', 'Utility'],
      },
    }),
    new MakerDeb({
      options: {
        bin: 'StarMesh',
        icon: 'assets/icon.png',
        categories: ['Network', 'Utility'],
      },
    }),
  ],
  publishers: [
    new PublisherGithub({
      repository: {
        owner: 'dohyeon-kinn',
        name: 'electron-example',
      },
      tagPrefix: process.env.PRE_RELEASE === 'true' ? `beta.${process.env.BETA_VERSION ?? 0}-v` : 'v',
      draft: false,
      generateReleaseNotes: true,
      prerelease: process.env.PRE_RELEASE === 'true',
    }),
  ],
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: 'main/index.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'main/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
