namespace Photiso
{
    using System.Windows;
    using System.Windows.Interactivity;
    using BellaCode.Mvvm;
    //using System.Windows.Forms;
    //using System.Windows.Interop;
    using System;
    using Microsoft.WindowsAPICodePack.Dialogs;

    public class BrowseFolderDialogAction : TriggerAction<UIElement>
    {        
        public string InitialDirectory
        {
            get { return (string)GetValue(InitialDirectoryProperty); }
            set { SetValue(InitialDirectoryProperty, value); }
        }

        public static readonly DependencyProperty InitialDirectoryProperty = DependencyProperty.Register("InitialDirectory", typeof(string), typeof(BrowseFolderDialogAction), new FrameworkPropertyMetadata(null));

        public string Description
        {
            get { return (string)GetValue(DescriptionProperty); }
            set { SetValue(DescriptionProperty, value); }
        }

        public static readonly DependencyProperty DescriptionProperty = DependencyProperty.Register("Description", typeof(string), typeof(BrowseFolderDialogAction), new FrameworkPropertyMetadata(null));


        public bool CanCreateNewFolder
        {
            get { return (bool)GetValue(CanCreateNewFolderProperty); }
            set { SetValue(CanCreateNewFolderProperty, value); }
        }

        public static readonly DependencyProperty CanCreateNewFolderProperty = DependencyProperty.Register("CanCreateNewFolder", typeof(bool), typeof(BrowseFolderDialogAction), new FrameworkPropertyMetadata(true));

        protected override void Invoke(object parameter)
        {
            var eventArgs = (InteractionEventArgs)parameter;

            if (string.IsNullOrEmpty(this.InitialDirectory))
            {
                this.InitialDirectory = eventArgs.Data as string;
            }

            var dialog = new CommonOpenFileDialog();
            dialog.IsFolderPicker = true;

            if (!string.IsNullOrEmpty(this.InitialDirectory))
            {
                dialog.InitialDirectory = this.InitialDirectory;
            }

            if (!string.IsNullOrEmpty(this.Description))
            {
                dialog.Title = this.Description;
            }

            var window = Window.GetWindow(this.AssociatedObject);
            
            eventArgs.Result = (dialog.ShowDialog(window) == CommonFileDialogResult.Ok) ? dialog.FileName : null;

        }
    }
}
