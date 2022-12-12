from parser import parse_text_2_json

import os
import argparse

parser = argparse.ArgumentParser(description='parse')
parser.add_argument("--directory", type=str, default=".", help="directory")


def clean_str(s):
    s = s.replace("&#8220;", "\"")
    s = s.replace("&#8221;", "\"")
    s = s.replace("&#8216;", "'")
    s = s.replace("&#8217;", "'")
    s = s.replace("&#8211;", "-")
    s = s.replace("&#8212;", "-")
    return s

if __name__ == "__main__": 
    args = parser.parse_args()
    directory = args.directory

    file_list = sorted( 
        filter(lambda x: os.path.isfile(os.path.join(directory, x)), os.listdir(directory)) 
    )
    
    for f in file_list:
        file_path = directory + "/" + f
        with open(file_path) as F:
            try: 
                content = clean_str(F.read())
                data = parse_text_2_json(content, f)
                print(data)
            except Exception as e:
                print(e)
                continue
        


