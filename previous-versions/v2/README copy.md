# Photiso
An application that helps organize your photos by date taken.

## Overview

### Why would you want your photos organized this way?

1. Your photos are important! 

Photos organized by date are easier to back up. When you back up a folder from a previous, you probably won't have new photos unless you time travel.

2. Photo programs are great!

Most photo gallery programs let you organize and re-organize your photos independent of how they are stored on disk.  You can organize your photos by date and yet still see all the photos of that time your uncle dropped the birthday cake.

3. Managing duplicate photos is a pain!

It is easy to make an accidental copy of a photo by double copying off your camera or moving files around.  Photiso detects exact duplicates and puts them out of the way in the duplicates folder. 

### Is Photiso safe?

**No promises** and you should always have a backup before you let an application move your photos around. Photiso works hard to either move a file to a location or leave it alone. It never modifies files.

### What are the system requirements?

The latest version is v2.  It should run on any Windows computer with Windows 8 or later.

## How do I use Photiso?

First, download [Photiso.zip](https://geoffcox.github.io/downloads/photiso2.zip).  Unzip and run 'photiso Setup 2.0.0.exe'.  This will install and run Photiso.

When you run Photiso you are presented with 3 folders to specify.

1. Source folder containing unorganized photos
2. Destination folder where photos should be organized
3. Folder where duplicates of photos should be placed.

Photiso looks in the source folder and folders within the source folder to find photos that aren't organized yet. The destination folder is where Photiso will move photo files and create the year/month folder structure.  

It is OK if the source and destination folders are the same since Photiso will not move a photo file if it is already in the right place.  If you have a large collection of photos, it is recommended to have the source folder be different from the destination folder so that Photiso doesn't have to look at every photo every time it organizes.

The duplicates folder is where duplicates will be put. The duplicates cannot be the same folder as the source nor the destination folders. 

## How does Photiso work exactly?

### Photiso organizes photos in folders
Each file is examined for photo information to get the date taken. Each photo file is placed into a year/month folder structure.  

Example: All the photos taken in April of 2008 would be put into the 2008/04 folder.

### Photiso names files with date taken information
Each photo is named with the all the date taken information: 'year-month-day hour.minute.second.partialSeconds.extension'.

Example: A photo (.jpg) taken on October 14th, 2006 at exactly 10:02 PM, Photiso would name the photo to 2006-10-14 22.02.00.000.jpg.

### Photiso looks at the file extension to determine if a file might be a photo
Photiso looks at all files with any of the following extensions: .JPG, .JPEG, .PNG, .BMP, .TIF, .WMP, and .ICO. Files with other extensions are not moved.

### Photiso falls back to use the file information.
If there isn't a date taken for a photo, Photiso will use the earliest of the created date or modified date of the file.

### Photiso uses a unique number based on the photo to handle duplicates.
Each duplicate photo is placed in the duplicates folder, but instead of by year/month they are put into folders based on their hash; a unique number created from the photo's image data.  Multiple duplicates all end up in the same folder.

Duplicates photo files are named just like organized photos so you can double-check they are duplicates before you delete them.
