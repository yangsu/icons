#!/bin/sh
FILE="itunes.cat"
OUTFILE="appstore.json"
OUTIMAGES="appstore.complete.json"
OUTDIR="appstore/"

function toJson() {
    sed -nE "/\<div\ id=\"selectedcontent\"/,/\<\/ul\>/{
        s/.+href=\"([^\"]+)\"\>([^\<]+)\<.+/\{\"name\": \"\\2\",\"link\":\"\\1\"},/p
    }"
}
function linkToJson() {
    curl -s "$1" | toJson
}

function scrape() {
    echo "{"
    cat $FILE | while read line; do
        link=$(echo $line | sed -nE "s/([^,]+),.+/\\1/p")
        cat=$(echo $line | sed -nE "s/[^,]+,(.+)/\\1/p")
        echo "\""$cat"\": ["
        linkToJson $link
        echo "],"
    done
    echo "}"
}

function extractImgLink() {
    cat $OUTFILE | awk '
    function linkToJson(link) {
        command="echo \\\"image\\\":\\\"$(curl -s "link" | grep \"width=\\\"175\\\"\" | sed -nE \"s/.+src=\\\"([^\\\"]+)\\\".+/\\\\1/p\")\\\","
        system(command)
    }
    /link/ {
        linkToJson($2)
    }
    {
        print $0
    }
    '
}

function download() {
    cat $OUTIMAGES | awk '
    function dl(link) {
        command="wget -q -P "outdir" "link" > /dev/null 2>&1"
        system(command)
    }
    /image/ {
        sub(/175x175/, "100x100")
        sub(/,/, "")
        dl($2)
    }
    ' outdir=$OUTDIR
}

# scrape > $OUTFILE
# extractImgLink > $OUTIMAGES
download








