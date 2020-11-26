using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Photiso
{
    public class PhotoDirectoryEventArgs : EventArgs
    {
        private readonly string directoryPath;

        public PhotoDirectoryEventArgs(string directoryPath)
        {
            if (directoryPath == null)
            {
                throw new ArgumentNullException("directoryPath");
            }

            this.directoryPath = directoryPath;
        }
       
        public string DirectoryPath
        {
            get
            {
                return this.directoryPath;
            }
        }      
    }
}
