using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Photiso
{
    public class PhotoEventArgs : EventArgs
    {
        private readonly string _fileName;

        public PhotoEventArgs(string fileName)
        {
            if (fileName == null)
            {
                throw new ArgumentNullException("fileName");
            }

            this._fileName = fileName;
        }

        public string FileName
        {
            get
            {
                return this._fileName;
            }
        }       
    }
}
