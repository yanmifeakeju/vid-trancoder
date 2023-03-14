//@ts-check

import {
  MediaConvertClient,
  CreateJobCommand,
} from '@aws-sdk/client-mediaconvert';

const client = new MediaConvertClient({ endpoint: process.env.MEDIA_ENDPOINT });
const outputBucketName = process.env.TRANSCODED_VIDEO_BUCKET;

const transcodeVideo = async (event, context) => {
  console.log(event);
  const key = event.Records[0].s3.object.key;
  const bucketName = event.Records[0].s3.bucket.name;
  const sourceKey = decodeURIComponent(key.replace(/\+g,/, ''));
  const outputKey = sourceKey.split('.')[0];

  const input = `s3://${bucketName}/${key}`;
  const output = `s3://${outputBucketName}/${outputKey}/`;

  try {
    const job = {
      Role: process.env.MEDIA_ROLE,
      Settings: {
        Inputs: [
          {
            FileInput: input,
            AudioSelectors: {
              'Audio Selector 1': {
                SelectorType: 'TRACK',
                Tracks: [1],
              },
            },
          },
        ],
        OutputGroups: [
          {
            Name: 'File Group',
            Outputs: [
              {
                Preset:
                  'System-Generic_Hd_Mp4_Avc_Aac_16x9_1920x1080p_24Hz_6Mbps',
                Extension: 'mp4',
                NameModifier: '_16x9_1920x1080p_24Hz_6Mbps',
              },
              {
                Preset:
                  'System-Generic_Hd_Mp4_Avc_Aac_16x9_1280x720p_24Hz_4.5Mbps',
                Extension: 'mp4',
                NameModifier: '_16x9_1280x720p_24Hz_4.5Mbps',
              },
              {
                Preset:
                  'System-Generic_Sd_Mp4_Avc_Aac_4x3_640x480p_24Hz_1.5Mbps',
                Extension: 'mp4',
                NameModifier: '_4x3_640x480p_24Hz_1.5Mbps',
              },
            ],
            OutputGroupSettings: {
              Type: 'FILE_GROUP_SETTINGS',
              FileGroupSettings: {
                Destination: output,
              },
            },
          },
        ],
      },
    };

    const command = new CreateJobCommand(job);
    await client.send(command);
  } catch (error) {
    console.error(error);
  }
};

export const handler = transcodeVideo;
