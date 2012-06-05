#!/bin/sh
FILE="icons.json"
OUTDIR="icons/"
BASE="http://iicns.com"
CATEGORY="categories/"
ECATEGORY=$(echo $CATEGORY | sed -nE "s/\//\\\\\//p")
CATEGORYFILE="categories.json"

function toJson() {
  sed -nE "/\<ul id=\"icons\"/,/\<\/ul\>/ {
    s/.+href=\"([^\"]+)\".+alt=\"([^\"]+)\".+src=\"([^\"]+)\".+/\{\"name\": \"\\2\",\"link\":\"\\1\",\"image\":\"\\3\"},/p
  }"
}
function linkToJson() {
  curl -s "$1" | toJson
}

function scrape() {
  # NOTE:16 is found manually
  END=1
  echo "["
  for (( i = 1; i <= $END; i++ )); do
    # echo Downloading Page $i/$END
    linkToJson "http://iicns.com/?page=$i"
  done
  echo "]"
}

function download() {
  cat $FILE | sed -nE 's/.+image\"\:\"([^\"]+)\".+/\1/p' | awk '
  BEGIN {
    d[512];
    d[256];
    d[144];
    d[114];
    d[72];
    d[57];
  }
  {
    for (x in d) {
      sub(/s[0-9]{2,3}/, "s"x)
      system("wget -q -P "outdir" "$1" > /dev/null 2>&1");
      print $1
    }
  }' outdir=$OUTDIR
}

function downloadCategories() {
    #| sed -nE s/.+href=\"([^\"]+)\".+alt=\"([^\"]+)\".+src=\"([^\"]+)\".+/\{\"name\": \"\\2\",\"link\":\"\\1\",\"image\":\"\\3\"},/p
  for item in {"/?category=Business|Business","/?category=Photo+%26+Video|Photo &amp; Video","/?category=Reference|Reference","/?category=Lifestyle|Lifestyle","/?category=Music|Music","/?category=Productivity|Productivity","/?category=Utilities|Utilities","/?category=Social+Networking|Social Networking","/?category=Games|Games","/?category=Entertainment|Entertainment","/?category=Health+%26+Fitness|Health &amp; Fitness","/?category=Travel|Travel","/?category=Education|Education","/?category=Navigation|Navigation","/?category=Sports|Sports","/?category=News|News","/?category=Finance|Finance","/?category=Weather|Weather","/?category=Book|Book","/?category=Catalogs|Catalogs","/?category=Medical|Medical","/?tag=Colorful|Colorful","/?tag=Fabric|Fabric","/?tag=Leather|Leather","/?tag=Metal|Metal","/?tag=Minimalistic|Minimalistic","/?tag=Pixel+art|Pixel art","/?tag=Wooden|Wooden","/?perspective=2D|2D","/?perspective=3D|3D"}; do
    echo $item | awk -F '|' '
    function linkToJson(link, file, page) {
      command="curl -s \""link"&page="page"\" | sed -nE \"/\\\<ul id=\\\"icons\\\"/,/\\\<\\\/ul\>/p\" >> \""category""file".txt\""
      print command
      system(command)
    }
    {
      for (i = 1; i <= 10; i++) {
        print $1"&page="i
        print linkToJson(base$1, $2, i)
      }
    }' base=$BASE category=$CATEGORY
  done
}

function extractCategories() {
  echo "{"
  for file in $CATEGORY*; do
    cate=$(echo $file | sed -nE "s/$ECATEGORY(.+)\.txt/\\1/p")
    echo "\"$cate\" : ["
    cat "$file" | toJson
    echo "],"
  done
  echo "}"
}

# scrape > $FILE
# download
# downloadCategories
extractCategories > $CATEGORYFILE