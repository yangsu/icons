require "open-uri"
folder = "appstore"
sizes = [100, 114, 175, 256,512]
currentsize = 100
counter = 1
File.open("itunes.cat", "r") do |infile|
    while (line = infile.gets)
        link, *cat = line.split(/,/)
        puts "link: #{link}, cat: #{cat}"
        open(link) {|f|
            f.each_line {|l|
                m = %r{<li><a href="([^"]+)">([^<]+)}.match(l)
                if m != nil
                    iteml = m[1]
                    itemtitle = m[2]
                    open (iteml) { |ff|
                        ff.each_line { |ll|
                            imgmatch = %r{<img width="175" height="175" alt="([^"]+)" class="artwork" src="([^"]+\/([a-zA-Z0-9\-_.]+\.\w{2,4}))}.match(ll)
                            if (imgmatch)
                                title = imgmatch[1]
                                imglink = imgmatch[2]
                                imgname = imgmatch[3]
                                small = imgname.gsub("175x175", "#{currentsize}x#{currentsize}")
                                smalll = imglink.gsub("175x175", "#{currentsize}x#{currentsize}")
                                puts small
                                open(smalll) {|fff|
                                   File.open("#{folder}/#{small}","wb+") do |file|
                                     file.puts fff.read
                                   end
                                }
                            end
                        }
                    }
                end
            }
        }
        counter = counter + 1
        if counter > 1
              break
        end
    end
end