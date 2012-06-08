#!/bin/sh
DIR = "icons/"

for img in $DIR*.tif; do
  base=$(echo $img | sed s/\.tif//)
  echo "converting $base"
  convert $base.tif $base.png
done
for img in $DIR*.tiff; do
  base=$(echo $img | sed s/\.tiff//)
  echo "converting $base"
  convert $base.tiff $base.png
done
