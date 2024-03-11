import * as fspromises from "node:fs/promises";
import * as exifr from "exifr";
import { PhotoInfo, Rotation } from "./ipc.types";

const rotations: Rotation[] = [0, 0, 180, 180, 270, 270, 90, 90];
const mirrored: boolean[] = [false, true, false, true, true, false, true, false];

const parseDateTimeOriginal = (data: {
  date?: string;
  subsecond?: string;
  timeZoneOffset?: string;
}): string | undefined => {
  console.log("parseDateTimeOriginal", data);

  // DateTimeOriginal : "2024:01:03 21:59:19"
  // SubSecTimeOriginal: "507"
  // OffsetTimeDigitized : "-08:00"
  const { date, subsecond, timeZoneOffset } = data;

  if (date) {
    const parts = date?.split(/\D/);

    if (parts && parts.length === 6) {
      return (
        `${parts[0]}-${parts[1]}-${parts[2]}` +
        `T${parts[3]}:${parts[4]}:${parts[5]}` +
        `${subsecond ? `.${subsecond}` : ""}` +
        `${timeZoneOffset ? `${timeZoneOffset}` : ""}`
      );
    }
  }

  return undefined;
};

export const getPhotoInfo = async (file: string): Promise<PhotoInfo> => {
  const stat = await fspromises.stat(file);
  const data = await exifr.parse(file, { reviveValues: false, translateValues: false });

  const orientation = data.Orientation && data.Orientation > 0 && data.Orientation < 9 ? data.Orientation : undefined;

  let resolutionX = data.XResolution;
  let resolutionY = data.YResolution;

  if (data.ResolutionUnit === 3) {
    resolutionX = resolutionX !== undefined ? resolutionX / 2.54 : resolutionX;
    resolutionY = resolutionY !== undefined ? resolutionY / 2.54 : resolutionY;
  }

  return {
    file,
    sizeInBytes: stat.size,
    dateTaken: parseDateTimeOriginal({
      date: data.DateTimeOriginal,
      subsecond: data.SubSecTimeOriginal,
      timeZoneOffset: data.OffsetTimeOriginal,
    }),
    height: data.ExifImageHeight,
    make: data.Make,
    model: data.Model,
    mirrored: orientation ? mirrored[orientation - 1] : undefined,
    rotation: orientation ? rotations[orientation - 1] : undefined,
    resolutionX: resolutionX,
    resolutionY: resolutionY,
    width: data.ExifImageWidth,
    exifData: data,
  };
};

// const getTimestampFileName = (prefix: string, exifDate: string, exifSubSecond?: string) => {
//   var parts = exifDate.split(/\D/);
//   var subSecondPart = exifSubSecond ? `-${exifSubSecond}` : "";
//   return `${prefix}${parts[0]}-${parts[1]}-${parts[2]}_${parts[3]}-${parts[4]}-${parts[5]}${subSecondPart}`;
// };

// export const getDateTaken = (exifData: ExifData): DateTaken | undefined => {
//   if (exifData?.exif?.DateTimeOriginal) {
//     const parts = exifData.exif.DateTimeOriginal.split(/\D/);
//     const exifSubSecond = (exifData.exif as any).SubSecTimeOriginal;
//     if (parts.length === 6) {
//       return {
//         year: Number.parseInt(parts[0]),
//         month: Number.parseInt(parts[1]),
//         day: Number.parseInt(parts[2]),
//         hour: Number.parseInt(parts[3]),
//         minute: Number.parseInt(parts[4]),
//         second: Number.parseInt(parts[5]),
//         subsecond: exifSubSecond ? Number.parseInt(exifSubSecond) : undefined
//       };
//     }
//   }

//   return undefined;
// };

// // exif orientation rotation:
// // 1,2 = 0deg
// // 3,4 = 180deg
// // 5,6 = 270deg
// // 7,8 = 90deg
// const rotations: Rotation[] = [0, 0, 180, 180, 270, 270, 90, 90];
// // exif orientation mirrored:
// // 1,3,6,8 = false
// // 2,4,5,7 = true
// const mirrored: boolean[] = [false, true, false, true, true, false, true, false];

// export const getOrientation = (exifData?: ExifData): Orientation | undefined => {
//   const exifOrientation = exifData?.image?.Orientation;
//   if (exifOrientation !== undefined && exifOrientation > 0 && exifOrientation < 9) {
//     return {
//       rotation: rotations[exifOrientation - 1],
//       mirrored: mirrored[exifOrientation - 1],
//     };
//   }

//   return undefined;
// };

// export const getDimensions = (exifData?: ExifData): { width: number; height: number } | undefined => {
//   const height = exifData?.exif?.ExifImageHeight ?? exifData?.image?.ImageHeight;
//   const width = exifData?.exif?.ExifImageWidth ?? exifData?.image?.ImageWidth;

//   if (height !== undefined || width !== undefined) {
//     return {
//       height: height ?? 0,
//       width: width ?? 0,
//     };
//   }

//   return undefined;
// };

// export const getResolution = (exifData?: ExifData): Resolution | undefined => {
//   if (exifData?.image?.XResolution || exifData?.image?.YResolution) {
//     return {
//       x: exifData?.image?.XResolution,
//       y: exifData?.image?.YResolution,
//     };
//   }

//   return undefined;
// };

// export const getCameraInfo = (exifData?: ExifData): CameraInfo | undefined => {
//   if (exifData?.image?.Make || exifData?.image?.Model) {
//     return {
//       make: exifData.image?.Make ?? "",
//       model: exifData.image?.Model ?? "",
//     };
//   }

//   return undefined;
// };
