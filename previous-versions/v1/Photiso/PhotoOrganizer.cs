using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;
using Microsoft.VisualBasic.FileIO;
using BellaCode;
using System.Threading;

namespace Photiso
{
    public class PhotoOrganizer
    {
        public PhotoOrganizer()
        {
        }

        public event EventHandler<PhotoDirectoryEventArgs> DirectoryStarted;
        public event EventHandler<PhotoDirectoryEventArgs> DirectorySkipped;
        public event EventHandler<PhotoDirectoryEventArgs> DirectoryFinished;

        public event EventHandler<PhotoEventArgs> FileStarted;
        public event EventHandler<PhotoMovedEventArgs> FileMoved;
        public event EventHandler<PhotoMovedEventArgs> DuplicateFileMoved;
        public event EventHandler<PhotoEventArgs> FileNotMoved;
        public event EventHandler<PhotoEventArgs> FileSkipped;
        public event EventHandler<PhotoErrorEventArgs> FileError;
        public event EventHandler<PhotoEventArgs> FileFinished;

        private void RaiseDirectoryStarted(string directoryPath)
        {
            if (DirectoryStarted != null)
            {
                DirectoryStarted(this, new PhotoDirectoryEventArgs(directoryPath));
            }
        }

        private void RaiseDirectorySkipped(string directoryPath)
        {
            if (DirectorySkipped != null)
            {
                DirectorySkipped(this, new PhotoDirectoryEventArgs(directoryPath));
            }
        }

        private void RaiseDirectoryFinished(string directoryPath)
        {
            if (DirectoryFinished != null)
            {
                DirectoryFinished(this, new PhotoDirectoryEventArgs(directoryPath));
            }
        }

        private void RaiseFileStarted(string fileName)
        {
            if (FileStarted != null)
            {
                FileStarted(this, new PhotoEventArgs(fileName));
            }
        }

        private void RaiseFileFinished(string fileName)
        {
            if (FileFinished != null)
            {
                FileFinished(this, new PhotoEventArgs(fileName));
            }
        }

        private void RaiseFileMoved(string sourceFileName, string destinationFileName)
        {
            if (FileMoved != null)
            {
                FileMoved(this, new PhotoMovedEventArgs(sourceFileName, destinationFileName));
            }
        }

        private void RaiseFileNotMoved(string fileName)
        {
            if (FileNotMoved != null)
            {
                FileNotMoved(this, new PhotoEventArgs(fileName));
            }
        }

        private void RaiseDuplicateFileMoved(string sourceFileName, string destinationFileName)
        {
            if (DuplicateFileMoved != null)
            {
                DuplicateFileMoved(this, new PhotoMovedEventArgs(sourceFileName, destinationFileName));
            }
        }

        private void RaiseFileSkipped(string fileName)
        {
            if (FileSkipped != null)
            {
                FileSkipped(this, new PhotoEventArgs(fileName));
            }
        }

        private void RaiseFileError(string fileName, string erorrMessage)
        {
            if (FileError != null)
            {
                FileError(this, new PhotoErrorEventArgs(fileName, erorrMessage));
            }
        }

        private string _unorganizedDirectoryPath;
        private string _organizedDirectoryPath;
        private string _duplicatesDirectoryPath;

        public void Organize(string unorganizedDirectoryPath, string organizedDirectoryPath, string duplicatesDirectoryPath, CancellationToken cancellationToken)
        {
            VerifyArgument.IsNotNullOrEmpty("unorganizedDirectoryPath", unorganizedDirectoryPath);
            VerifyArgument.IsNotNullOrEmpty("organizedDirectoryPath", organizedDirectoryPath);
            VerifyArgument.IsNotNullOrEmpty("duplicatesDirectoryPath", duplicatesDirectoryPath);

            this._unorganizedDirectoryPath = unorganizedDirectoryPath;
            this._organizedDirectoryPath = organizedDirectoryPath;
            this._duplicatesDirectoryPath = duplicatesDirectoryPath;

            if (!Directory.Exists(this._unorganizedDirectoryPath))
            {
                throw new DirectoryNotFoundException(string.Format("Directory not found. {0}", this._unorganizedDirectoryPath));
            }

            OrganizeDirectory(this._unorganizedDirectoryPath, cancellationToken);
        }

        private void OrganizeDirectory(string directoryPath, CancellationToken cancellationToken)
        {
            if (string.Equals(directoryPath, this._duplicatesDirectoryPath, StringComparison.InvariantCultureIgnoreCase))
            {
                this.RaiseDirectorySkipped(directoryPath);
                return;
            }

            this.RaiseDirectoryStarted(directoryPath);

            string[] filePaths = Directory.GetFiles(directoryPath);
            foreach (string filePath in filePaths)
            {
                if (cancellationToken.IsCancellationRequested)
                {
                    return;
                }

                RaiseFileStarted(filePath);
                if (PhotoInfo.IsPhotoFileExtension(Path.GetExtension(filePath)))
                {
                    try
                    {
                        PhotoInfo photoInfo = this.GetOrCreatePhotoInfo(filePath);
                        PlacePhoto(photoInfo);
                    }
                    catch (Exception ex)
                    {
                        RaiseFileError(filePath, ex.Message);
                    }
                }
                else
                {
                    string fileName = Path.GetFileName(filePath);
                    if (!fileName.Equals("Thumbs.db", StringComparison.InvariantCultureIgnoreCase) &&
                        !fileName.Equals("Desktop.ini", StringComparison.InvariantCultureIgnoreCase))
                    {
                        RaiseFileSkipped(filePath);
                    }
                }

                RaiseFileFinished(filePath);
            }

            string[] childDirectoryNames = Directory.GetDirectories(directoryPath);
            foreach (string childDirectoryName in childDirectoryNames)
            {
                if (cancellationToken.IsCancellationRequested)
                {
                    return;
                }

                OrganizeDirectory(childDirectoryName, cancellationToken);
            }

            this.RaiseDirectoryFinished(directoryPath);
        }

        private void PlacePhoto(PhotoInfo photoInfo)
        {
            string sourceFilePath = string.Empty;
            string destinationFilePath = string.Empty;
            try
            {
                sourceFilePath = photoInfo.FileName;

                string destinationDirectoryPath = GetPhotoDestinationDirectoryName(this._organizedDirectoryPath, photoInfo);
                int conflictRevision = 1;

                while (true)
                {
                    destinationFilePath = Path.Combine(destinationDirectoryPath, GetPhotoDestinationFileName(photoInfo, conflictRevision));

                    // If the file is already in the right place, then I skip it
                    if (string.Equals(sourceFilePath, destinationFilePath, StringComparison.InvariantCultureIgnoreCase))
                    {
                        RaiseFileNotMoved(sourceFilePath);
                        break;
                    }

                    // I move duplicates into the duplicates directory
                    if (File.Exists(destinationFilePath))
                    {
                        if (IsSamePhoto(photoInfo, destinationFilePath) == true)
                        {
                            this.MovePhotoToDuplicatesDirectory(photoInfo);
                            this.RaiseDuplicateFileMoved(sourceFilePath, destinationFilePath);
                            break;
                        }
                        else
                        {
                            conflictRevision++;
                        }
                    }
                    else
                    {
                        this.MovePhoto(sourceFilePath, destinationFilePath);
                        this.RaiseFileMoved(sourceFilePath, destinationFilePath);
                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                RaiseFileError(sourceFilePath, ex.Message);
            }
        }

        private void MovePhotoToDuplicatesDirectory(PhotoInfo photoInfo)
        {
            // I use the file hash to put duplicates into the same directory
            string fileHash = BitConverter.ToString(photoInfo.FileHash).Replace("-", string.Empty);

            string destinationDirectoryPath = Path.Combine(this._duplicatesDirectoryPath, fileHash);

            string destinationFilePath;

            int conflictRevision = 1;

            while (true)
            {
                destinationFilePath = Path.Combine(destinationDirectoryPath, GetPhotoDestinationFileName(photoInfo, conflictRevision));

                if (File.Exists(destinationFilePath))
                {
                    conflictRevision++;
                }
                else
                {
                    this.MovePhoto(photoInfo.FileName, destinationFilePath);
                    break;
                }
            }
        }

        private void MovePhoto(string fromFilePath, string toFilePath)
        {
            string directoryPath = Path.GetDirectoryName(toFilePath);
            if (!Directory.Exists(directoryPath))
            {
                Directory.CreateDirectory(directoryPath);
            }

            File.Move(fromFilePath, toFilePath);
        }

        private static string GetPhotoDestinationDirectoryName(string directoryPath, PhotoInfo photoInfo)
        {
            DateTime photoDateTime = photoInfo.DateTime;

            string year = photoDateTime.ToString("yyyy");
            string month = photoDateTime.ToString("MM");
            string destinationDirectoryPath = Path.Combine(directoryPath, year);
            destinationDirectoryPath = Path.Combine(destinationDirectoryPath, month);
            return destinationDirectoryPath;
        }

        private static string GetPhotoDestinationFileName(PhotoInfo photoInfo, int conflictRevision)
        {
            DateTime photoDateTime = photoInfo.DateTime;

            string year = photoDateTime.ToString("yyyy");
            string month = photoDateTime.ToString("MM");
            string day = photoDateTime.ToString("dd");
            string hour = photoDateTime.ToString("HH"); //24 hour clock
            string minute = photoDateTime.ToString("mm");
            string revision = conflictRevision.ToString("D3");
            string extension = Path.GetExtension(photoInfo.FileName);

            if (conflictRevision > 0)
            {
                return string.Format("IMG {0}-{1}-{2} {3}.{4}.{5}{6}",
                    year, month, day, hour, minute, revision, extension);
            }
            else
            {
                return string.Format("IMG {0}-{1}-{2} {3}.{4}{5}",
                    year, month, day, hour, minute, extension);
            }
        }

        private bool? IsSamePhoto(PhotoInfo photoInfo, string otherFilePath)
        {
            try
            {
                PhotoInfo otherPhotoInfo = this.GetOrCreatePhotoInfo(otherFilePath);
                if (photoInfo.FileHash.Length != otherPhotoInfo.FileHash.Length)
                {
                    return false;
                }

                for (int i = 0; i < photoInfo.FileHash.Length; i++)
                {
                    if (photoInfo.FileHash[i] != otherPhotoInfo.FileHash[i])
                    {
                        return false;
                    }
                }

                return true;
            }
            catch (Exception)
            {
                return null;
            }
        }

        private Dictionary<string, PhotoInfo> _photoInfoCache = new Dictionary<string, PhotoInfo>();

        private void CachePhotoInfo(PhotoInfo photoInfo)
        {
            if (this._photoInfoCache.Count > 10000)
            {
                this._photoInfoCache.Clear();
            }

            this._photoInfoCache[photoInfo.FileName] = photoInfo;
        }

        private bool TryGetCachedPhotoInfo(string filePath, out PhotoInfo photoInfo)
        {
            return this._photoInfoCache.TryGetValue(filePath, out photoInfo);
        }

        private PhotoInfo GetOrCreatePhotoInfo(string filePath)
        {
            PhotoInfo photoInfo;
            if (!this.TryGetCachedPhotoInfo(filePath, out photoInfo))
            {
                photoInfo = new PhotoInfo(filePath);
                this.CachePhotoInfo(photoInfo);
            }

            return photoInfo;
        }
    }
}
