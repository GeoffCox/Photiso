using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Photiso
{
    public class PhotoMovedEventArgs : EventArgs
    {
        private readonly string _sourceFileName;
        private readonly string _destinationFileName;

        public PhotoMovedEventArgs(string sourceFileName, string destinationFileName)
        {
            if (sourceFileName == null)
            {
                throw new ArgumentNullException("sourceFileName");
            }
            if (destinationFileName == null)
            {
                throw new ArgumentNullException("destinationFileName");
            }

            this._sourceFileName = sourceFileName;
            this._destinationFileName = destinationFileName;            
        }       

        public string SourceFileName
        {
            get
            {
                return this._sourceFileName;
            }
        }

        public string DestinationFileName
        {
            get
            {
                return this._destinationFileName;
            }
        }        
    }
}
