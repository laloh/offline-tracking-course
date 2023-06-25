#!/bin/bash

# Ensure there is exactly one argument
if [ "$#" -ne 1 ]; then
    echo "Usage: ./mvFilesToRoot.sh <root_directory>"
    exit 1
fi

# Get the root directory parameter
root_directory="$1"

# Find all files in subdirectories and move them to the root directory
find "$root_directory" -mindepth 2 -type f -exec sh -c '
    for file do
        mv "$file" "$1"
    done
' sh "$root_directory" {} +

# Find and remove all empty directories
find "$root_directory" -mindepth 1 -type d -empty -delete
