#!/bin/bash

docker-compose down

current_dir="${PWD}"
folder_name=$(basename "${current_dir}")

docker-compose down
docker volume rm ${folder_name}_d1 ${folder_name}_d2 ${folder_name}_d3