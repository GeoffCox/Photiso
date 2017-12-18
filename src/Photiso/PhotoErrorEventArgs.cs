using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Photiso
{
    public class PhotoErrorEventArgs : EventArgs
    {
        private readonly string _fileName;
        private readonly string _errorMessage;

        public PhotoErrorEventArgs(string fileName, string errorMessage)
        {
            if (fileName == null)
            {
                throw new ArgumentNullException("fileName");
            }

            if (errorMessage == null)
            {
                throw new ArgumentNullException("errorMessage");
            }

            this._fileName = fileName;
            this._errorMessage = errorMessage;
        }

        public string FileName
        {
            get
            {
                return this._fileName;
            }
        }

        public string ErrorMessage
        {
            get
            {
                return this._errorMessage;
            }
        }    
    }
}
