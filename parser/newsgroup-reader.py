################################################################################
# Read newsgroup
# Assuming each post is an indivual file
################################################################################

import os
import argparse
from parser import parse_text_2_json


parser = argparse.ArgumentParser(description='A test')
parser.add_argument("--directory", type=str, default=".", help="directory")

# Vanilla assembly
def vanilla(lines):
    text = " ".join(lines)
    return parse_text_2_json(text)


if __name__ == "__main__": 
    args = parser.parse_args()
    directory = args.directory

    file_list = sorted( filter(lambda x: os.path.isfile(os.path.join(directory, x)), os.listdir(directory)) )
    
    for f in file_list:
        file_path = directory + "/" + f
        with open(file_path) as F:
            # lines = F.readlines()
            lines = F.read().splitlines()
            print(vanilla(lines))
        
    

