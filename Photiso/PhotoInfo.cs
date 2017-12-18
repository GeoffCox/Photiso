namespace Photiso
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.IO;
    using System.Windows.Media.Imaging;
    using System.Globalization;
    using System.Security.Cryptography;
    using System.Diagnostics;

    public class PhotoInfo
    {
        #region Fields

        private string _fileName;
        private DateTime? _takenDateTime;
        private DateTime _createdDateTime;
        private DateTime _modifiedDateTime;
        private DateTime _dateTime;
        private long _length;
        private byte[] _fileHash;

        private static string[] _photoFileExtensions = new string[] { ".jpg", ".jpeg", ".gif", ".bmp", ".png", ".tif", ".wmp", ".ico" };

        #endregion

        #region Constructors

        public PhotoInfo(string fileName)
        {
            if (fileName == null)
            {
                throw new ArgumentNullException("fileName");
            }
            if (fileName.Length == 0)
            {
                throw new ArgumentException("File name is empty.", "fileName");
            }
            if (!File.Exists(fileName))
            {
                throw new FileNotFoundException("Photo file not found.", fileName);
            }

            this._fileName = fileName;

            LoadPhotoInfo();
        }

        #endregion

        #region Properties

        public string FileName
        {
            get
            {
                return this._fileName;
            }
        }

        public byte[] FileHash
        {
            get
            {
                if (this._fileHash == null)
                {
                    this.LoadFileHash();
                }
                return _fileHash;
            }
        }

        public DateTime? TakenDateTime
        {
            get
            {
                return this._takenDateTime;
            }
        }

        public DateTime CreatedDateTime
        {
            get
            {
                return this._createdDateTime;
            }
        }

        public DateTime ModifiedDateTime
        {
            get
            {
                return this._modifiedDateTime;
            }
        }

        public DateTime DateTime
        {
            get
            {
                return this._dateTime;
            }
        }

        public long Length
        {
            get
            {
                return this._length;
            }
        }

        public static string[] PhotoFileExtensions
        {
            get
            {
                return _photoFileExtensions;
            }
        }

        #endregion

        #region Methods

        public static bool IsPhotoFileExtension(string fileExtension)
        {
            return _photoFileExtensions.Contains(fileExtension, StringComparer.InvariantCultureIgnoreCase);
        }

        private void LoadPhotoInfo()
        {
            FileInfo fileInfo = new FileInfo(this._fileName);
            this._length = fileInfo.Length;
            this._createdDateTime = fileInfo.CreationTime;
            this._modifiedDateTime = fileInfo.LastWriteTime;


            using (FileStream file = File.OpenRead(this._fileName))
            {
                this._takenDateTime = null;
                if (this.Length != 0)
                {
                    // I ignore the color profile because it can be corrupted easily (http://www.hanselman.com/blog/DealingWithImagesWithBadMetadataCorruptedColorProfilesInWPF.aspx)
                    // and all I want is the DateTime the picture was taken.
                    BitmapSource src = BitmapFrame.Create(file, BitmapCreateOptions.IgnoreColorProfile, BitmapCacheOption.Default);

                    BitmapMetadata metadata = (BitmapMetadata)src.Metadata;

                    if (metadata != null)
                    {
                        DateTime takenDateTime;

                        try
                        {
                            if (DateTime.TryParse(metadata.DateTaken, CultureInfo.CurrentCulture, System.Globalization.DateTimeStyles.AssumeLocal, out takenDateTime))
                            {
                                this._takenDateTime = takenDateTime;
                            }
                        }
                        catch (NotSupportedException)
                        {
                            Debug.WriteLine("DateTaken not supported for photo '{0}'.", this._fileName);
                        }
                    }
                }
            }


            if (this._takenDateTime.HasValue)
            {
                // I prefer the date time from a camera
                this._dateTime = this._takenDateTime.Value;
            }
            else
            {
                // I take the earliest date between created and modified
                this._dateTime = this._createdDateTime < this._modifiedDateTime ? this._createdDateTime : this._modifiedDateTime;
            }
        }

        private void LoadFileHash()
        {
            using (FileStream file = File.OpenRead(this._fileName))
            {
                //load the file hash
                using (MD5 md5 = MD5.Create())
                {
                    this._fileHash = md5.ComputeHash(file);
                }
            }
        }

        #endregion
    }
}
