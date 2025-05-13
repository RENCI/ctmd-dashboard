from utils import submit
import sys

host = sys.argv[1]
cache_dir = sys.argv[2]
args = sys.argv[3:]

submit(host, cache_dir, "tic.Transform", *args)
