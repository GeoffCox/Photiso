using BellaCode.Mvvm;
using Photiso.Properties;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Threading;

namespace Photiso
{
    public class MainViewModel : ViewModel
    {
        private TaskScheduler _foregroundTaskScheduler;

        public MainViewModel()
        {
            this._processingTimer.Interval = new TimeSpan(10);
            this._processingTimer.Tick += ProcessingTimer_Tick;
            this._foregroundTaskScheduler = TaskScheduler.FromCurrentSynchronizationContext();
        }

        private string _unorganizedFolder;

        public string UnorganizedFolder
        {
            get
            {
                return this._unorganizedFolder;
            }
            set
            {
                if (this._unorganizedFolder != value)
                {
                    this._unorganizedFolder = value;
                    this.RaisePropertyChanged();
                }
            }
        }

        public event EventHandler<InteractionEventArgs<string, string>> UnorganizedFolderLocationRequested;

        private string RaiseUnorganizedFolderLocationRequested()
        {
            if (this.UnorganizedFolderLocationRequested != null)
            {
                var e = new InteractionEventArgs<string, string>(this.UnorganizedFolder);
                UnorganizedFolderLocationRequested(this, e);
                return e.Result;
            }

            return null;
        }

        private string _organizedFolder;

        public string OrganizedFolder
        {
            get
            {
                return this._organizedFolder;
            }
            set
            {
                if (this._organizedFolder != value)
                {
                    this._organizedFolder = value;
                    this.RaisePropertyChanged();
                }
            }
        }

        public event EventHandler<InteractionEventArgs<string, string>> OrganizedFolderLocationRequested;

        private string RaiseOrganizedFolderLocationRequested()
        {
            if (this.OrganizedFolderLocationRequested != null)
            {
                var e = new InteractionEventArgs<string, string>(this.OrganizedFolder);
                OrganizedFolderLocationRequested(this, e);
                return e.Result;
            }

            return null;
        }

        private string _duplicatesFolder;

        public string DuplicatesFolder
        {
            get
            {
                return this._duplicatesFolder;
            }
            set
            {
                if (this._duplicatesFolder != value)
                {
                    this._duplicatesFolder = value;
                    this.RaisePropertyChanged();
                }
            }
        }

        public event EventHandler<InteractionEventArgs<string, string>> DuplicatesFolderLocationRequested;

        private string RaiseDuplicatesFolderLocationRequested()
        {
            if (this.DuplicatesFolderLocationRequested != null)
            {
                var e = new InteractionEventArgs<string, string>(this.DuplicatesFolder);
                DuplicatesFolderLocationRequested(this, e);
                return e.Result;
            }

            return null;
        }

        private bool _isStarted;

        public bool IsStarted
        {
            get
            {
                return this._isStarted;
            }
            private set
            {
                if (this._isStarted != value)
                {
                    this._isStarted = value;
                    this.RaisePropertyChanged();
                    this.RaisePropertyChanged("CanPause");
                    this.RaisePropertyChanged("CanResume");
                    this.RaisePropertyChanged("CanBrowse");
                }
            }
        }

        private CancellationTokenSource _cancellationTokenSource;
        private CancellationToken _cancellationToken;
        private static object _isProcessingSyncRoot = new object();
        private volatile bool _isProcessing;

        public bool IsProcessing
        {
            get
            {
                return this._isProcessing;
            }
            private set
            {
                if (this._isProcessing != value)
                {
                    this._isProcessing = value;
                    this.RaisePropertyChanged();
                    this.RaisePropertyChanged("CanStart");
                    this.RaisePropertyChanged("CanStop");
                    this.RaisePropertyChanged("CanPause");
                    this.RaisePropertyChanged("CanResume");
                }
            }
        }

        private bool _isPaused;

        public bool IsPaused
        {
            get
            {
                return this._isPaused;
            }
            private set
            {
                if (this._isPaused != value)
                {
                    this._isPaused = value;
                    this.RaisePropertyChanged();
                    this.RaisePropertyChanged("CanPause");
                    this.RaisePropertyChanged("CanResume");
                }
            }
        }

        private DispatcherTimer _processingTimer = new DispatcherTimer();
        private Stopwatch _processingStopwatch = new Stopwatch();

        public TimeSpan ProcessingDuration
        {
            get
            {
                return this._processingStopwatch.Elapsed;
            }
        }

        void ProcessingTimer_Tick(object sender, EventArgs e)
        {
            this.RaisePropertyChanged("ProcessingDuration");
            this.FilesPerSecond = this._processingStopwatch.ElapsedMilliseconds > 0 ? ((double)this.ProcessedCount) / (this._processingStopwatch.ElapsedMilliseconds / 1000.0) : 0.0;
        }

        private double _filesPerSecond;

        public double FilesPerSecond
        {
            get
            {
                return this._filesPerSecond;
            }
            private set
            {
                if (this._filesPerSecond != value)
                {
                    this._filesPerSecond = value;
                    this.RaisePropertyChanged();
                }
            }
        }

        private string _currentFile;

        public string CurrentFile
        {
            get
            {
                return this._currentFile;
            }
            private set
            {
                if (this._currentFile != value)
                {
                    this._currentFile = value;
                    this.RaisePropertyChanged();
                }
            }
        }

        private int _processedCount;

        public int ProcessedCount
        {
            get
            {
                return this._processedCount;
            }
            private set
            {
                if (this._processedCount != value)
                {
                    this._processedCount = value;
                    this.RaisePropertyChanged();
                }
            }
        }

        private int _organizedCount;

        public int OrganizedCount
        {
            get
            {
                return this._organizedCount;
            }
            private set
            {
                if (this._organizedCount != value)
                {
                    this._organizedCount = value;
                    this.RaisePropertyChanged();
                }
            }
        }

        private int _duplicatesCount;

        public int DuplicatesCount
        {
            get
            {
                return this._duplicatesCount;
            }
            private set
            {
                if (this._duplicatesCount != value)
                {
                    this._duplicatesCount = value;
                    this.RaisePropertyChanged();
                }
            }
        }

        private int _skippedCount;

        public int SkippedCount
        {
            get
            {
                return this._skippedCount;
            }
            private set
            {
                if (this._skippedCount != value)
                {
                    this._skippedCount = value;
                    this.RaisePropertyChanged();
                }
            }
        }

        private int _errorsCount;

        public int ErrorCount
        {
            get
            {
                return this._errorsCount;
            }
            private set
            {
                if (this._errorsCount != value)
                {
                    this._errorsCount = value;
                    this.RaisePropertyChanged();
                }
            }
        }

        public bool CanStart
        {
            get
            {
                return !this._isProcessing;
            }
        }

        public event EventHandler<InteractionEventArgs<object>> ProcessingError;

        private void RaiseProcessingError()
        {
            if (this.ProcessingError != null)
            {
                var e = new InteractionEventArgs<object>(null);
                ProcessingError(this, e);
            }
        }

        public void Start()
        {
            if (this._isProcessing)
            {
                return;
            }

            lock (_isProcessingSyncRoot)
            {
                if (this._isProcessing)
                {
                    return;
                }

                this.IsProcessing = true;
            }

            if (!this._isPaused)
            {
                this.ResetStatistics();
            }

            this.IsPaused = false;
            this.IsStarted = true;

            this._cancellationTokenSource = new CancellationTokenSource();
            this._cancellationToken = _cancellationTokenSource.Token;

            this._processingTimer.Start();
            this._processingStopwatch.Start();

            Task.Factory.StartNew(() =>
                {
                    PhotoOrganizer organizer = null;
                    try
                    {
                        organizer = new PhotoOrganizer();
                        organizer.FileStarted += PhotoOrganizer_FileStarted;
                        organizer.FileMoved += PhotoOrganizer_FileMoved;
                        organizer.FileNotMoved += PhotoOrganizer_FileNotMoved;
                        organizer.DuplicateFileMoved += PhotoOrganizer_DuplicateFileMoved;
                        organizer.FileSkipped += PhotoOrganizer_FileSkipped;
                        organizer.FileError += PhotoOrganizer_FileError;
                        organizer.FileFinished += PhotoOrganizer_FileFinished;
                        organizer.Organize(this._unorganizedFolder, this._organizedFolder, this._duplicatesFolder, this._cancellationToken);
                    }
                    catch (Exception ex)
                    {
                        this.HandlePhotoOrganizerFailed(ex);
                    }
                    finally
                    {
                        if (organizer != null)
                        {
                            organizer.FileStarted -= PhotoOrganizer_FileStarted;
                            organizer.FileMoved -= PhotoOrganizer_FileMoved;
                            organizer.FileNotMoved -= PhotoOrganizer_FileNotMoved;
                            organizer.DuplicateFileMoved -= PhotoOrganizer_DuplicateFileMoved;
                            organizer.FileSkipped -= PhotoOrganizer_FileSkipped;
                            organizer.FileError -= PhotoOrganizer_FileError;
                            organizer.FileFinished -= PhotoOrganizer_FileFinished;
                        }
                    }
                }, this._cancellationToken)
                .ContinueWith(t =>
                    {
                        this._processingStopwatch.Stop();
                        this._processingTimer.Stop();

                        if (!this._cancellationToken.IsCancellationRequested)
                        {
                            if (!this._isPaused)
                            {
                                this.IsStarted = false;
                                this.CurrentFile = "DONE";
                            }
                        }

                        this._cancellationToken = CancellationToken.None;
                        this._cancellationTokenSource = null;

                        lock (_isProcessingSyncRoot)
                        {
                            this.IsProcessing = false;
                        }
                    }
                , CancellationToken.None, TaskContinuationOptions.None, this._foregroundTaskScheduler);
        }

        void PhotoOrganizer_FileStarted(object sender, PhotoEventArgs e)
        {
            Task.Factory.StartNew(() =>
            {
                this.CurrentFile = e.FileName;
            }, CancellationToken.None, TaskCreationOptions.None, this._foregroundTaskScheduler)
            .Wait();
        }

        void PhotoOrganizer_FileMoved(object sender, PhotoMovedEventArgs e)
        {
            Task.Factory.StartNew(() =>
            {
                this.OrganizedCount++;
            }, CancellationToken.None, TaskCreationOptions.None, this._foregroundTaskScheduler)
            .Wait();
        }

        void PhotoOrganizer_FileNotMoved(object sender, PhotoEventArgs e)
        {
            Task.Factory.StartNew(() =>
            {
                this.OrganizedCount++;
            }, CancellationToken.None, TaskCreationOptions.None, this._foregroundTaskScheduler)
           .Wait();
        }

        void PhotoOrganizer_DuplicateFileMoved(object sender, PhotoMovedEventArgs e)
        {
            Task.Factory.StartNew(() =>
            {
                this.DuplicatesCount++;
            }, CancellationToken.None, TaskCreationOptions.None, this._foregroundTaskScheduler)
           .Wait();
        }

        void PhotoOrganizer_FileError(object sender, PhotoErrorEventArgs e)
        {
            Task.Factory.StartNew(() =>
            {
                this.ErrorCount++;
            }, CancellationToken.None, TaskCreationOptions.None, this._foregroundTaskScheduler)
            .Wait();
        }

        void PhotoOrganizer_FileSkipped(object sender, PhotoEventArgs e)
        {
            Task.Factory.StartNew(() =>
            {
                this.SkippedCount++;
            }, CancellationToken.None, TaskCreationOptions.None, this._foregroundTaskScheduler)
            .Wait();
        }

        void PhotoOrganizer_FileFinished(object sender, PhotoEventArgs e)
        {
            Task.Factory.StartNew(() =>
            {
                this.ProcessedCount++;
            }, CancellationToken.None, TaskCreationOptions.None, this._foregroundTaskScheduler)
            .Wait();
        }

        void HandlePhotoOrganizerFailed(Exception ex)
        {
            Task.Factory.StartNew(() =>
            {
                this.RaiseProcessingError();
            }, CancellationToken.None, TaskCreationOptions.None, this._foregroundTaskScheduler)
            .Wait();
        }

        private void ResetStatistics()
        {
            this.CurrentFile = string.Empty;
            this._processingStopwatch.Reset();
            this.FilesPerSecond = 0;

            this.ProcessedCount = 0;
            this.OrganizedCount = 0;
            this.DuplicatesCount = 0;
            this.SkippedCount = 0;
            this.ErrorCount = 0;
        }

        public bool CanPause
        {
            get
            {
                return this._isProcessing && !this._isPaused;
            }
        }

        public void Pause()
        {
            this.IsPaused = true;

            var cancellationTokenSource = this._cancellationTokenSource;
            if (cancellationTokenSource != null)
            {
                cancellationTokenSource.Cancel();
            }
        }

        public bool CanResume
        {
            get
            {
                return this._isPaused;
            }
        }

        public void Resume()
        {
            this.Start();
        }

        public bool CanStop
        {
            get
            {
                return this._isStarted;
            }
        }

        public void Stop()
        {
            this.IsPaused = false;
            this.IsStarted = false;

            var cancellationTokenSource = this._cancellationTokenSource;
            if (cancellationTokenSource != null)
            {
                cancellationTokenSource.Cancel();
            }
        }

        public bool CanBrowse
        {
            get
            {
                return !this._isStarted;
            }
        }

        public void Browse(string propertyToSet)
        {
            switch (propertyToSet)
            {
                case "UnorganizedFolder":
                    {
                        var path = this.RaiseUnorganizedFolderLocationRequested();
                        if (path != null)
                        {
                            this.UnorganizedFolder = path;
                        }
                    }
                    break;
                case "OrganizedFolder":
                    {
                        var path = this.RaiseOrganizedFolderLocationRequested();
                        if (path != null)
                        {
                            this.OrganizedFolder = path;
                        }
                    }
                    break;
                case "DuplicatesFolder":
                    {
                        var path = this.RaiseDuplicatesFolderLocationRequested();
                        if (path != null)
                        {
                            this.DuplicatesFolder = path;
                        }
                    }
                    break;
            }
        }

        protected override void OnViewChanged(object oldValue, object newValue)
        {
            base.OnViewChanged(oldValue, newValue);

            if (oldValue == null && newValue != null)
            {
                this.UnorganizedFolder = Settings.Default.UnorganizedFolder;
                this.OrganizedFolder = Settings.Default.OrganizedFolder;
                this.DuplicatesFolder = Settings.Default.DuplicatesFolder;

                var myPicturesFolder = Environment.GetFolderPath(Environment.SpecialFolder.MyPictures);

                if (string.IsNullOrEmpty(this.UnorganizedFolder))
                {
                    this.UnorganizedFolder = Path.Combine(myPicturesFolder, "Upload");
                }

                if (string.IsNullOrEmpty(this.OrganizedFolder))
                {
                    this.OrganizedFolder = Path.Combine(myPicturesFolder, "ByDate");
                }

                if (string.IsNullOrEmpty(this.DuplicatesFolder))
                {
                    this.DuplicatesFolder = Path.Combine(myPicturesFolder, "Duplicates");
                }
            }
        }

        public bool CanSaveSettings
        {
            get
            {
                return true;
            }
        }

        public void SaveSettings()
        {
            if (!string.IsNullOrEmpty(this.UnorganizedFolder))
            {
                Settings.Default.UnorganizedFolder = this.UnorganizedFolder;
            }
            if (!string.IsNullOrEmpty(this.OrganizedFolder))
            {
                Settings.Default.OrganizedFolder = this.OrganizedFolder;
            }
            if (!string.IsNullOrEmpty(this.DuplicatesFolder))
            {
                Settings.Default.DuplicatesFolder = this.DuplicatesFolder;
            }

            Settings.Default.Save();
        }


    }
}
