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