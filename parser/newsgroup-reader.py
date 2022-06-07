################################################################################
# Read newsgroup
# Assuming each post is an indivual file
# See https://www.kaggle.com/datasets/crawford/20-newsgroups
################################################################################

import os
import argparse
from parser import parse_text_2_json


parser = argparse.ArgumentParser(description='A test')
parser.add_argument("--directory", type=str, default=".", help="directory")

newsgroup_stop_words = [
    "x-newsreader",
    "in article <",
    "nntp-posting-host:",
    "distribution:",
    "news-software:",
    "organization:",
    "lines:",
    "subject:",
    "from:",
    ">",
    "in-reply-to:",
    "reply-to:",
    "originator:",
    "x-disclaimer:",
    "x-newsposter:",
    "nf-id:",
    "nf-from:",
    "|",
    "["
]

# Vanilla assembly
def vanilla(lines, doc_id):
    filtered_lines = []
    # Remove headers and prior portions
    for line in lines:
        lower = line.lower()
        should_stop = False
        
        for stop in newsgroup_stop_words:
            if lower.startswith(stop):
                should_stop = True
                break

        if should_stop == True:
            continue
        
        filtered_lines.append(line)

    text = " ".join(filtered_lines)
    return parse_text_2_json(text, doc_id)


if __name__ == "__main__": 
    args = parser.parse_args()
    directory = args.directory

    file_list = sorted( filter(lambda x: os.path.isfile(os.path.join(directory, x)), os.listdir(directory)) )
    
    for f in file_list:
        file_path = directory + "/" + f
        with open(file_path) as F:
            try: 
                lines = F.read().splitlines()
                t = vanilla(lines, f)
                print(t)
            except:
                continue
        
