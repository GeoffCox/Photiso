using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Input;

namespace Photiso
{
    public static class MainCommands
    {
        public static RoutedCommand Start = new RoutedCommand("Start", typeof(MainCommands));        
        public static RoutedCommand Stop = new RoutedCommand("Stop", typeof(MainCommands));

        public static RoutedCommand Pause = new RoutedCommand("Pause", typeof(MainCommands));
        public static RoutedCommand Resume = new RoutedCommand("Resume", typeof(MainCommands));

        public static RoutedCommand Browse = new RoutedCommand("Browse", typeof(MainCommands));

        public static RoutedCommand SaveSettings = new RoutedCommand("SaveSettings", typeof(MainCommands));
    }
}
