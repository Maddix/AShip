#! /usr/bin/python3

import sys

# Still a work in progress

def load_file(path, filename, operation="r"):
	file = []
	with open(path + filename, operation) as open_file:
		file = open_file.readlines()
	return file

# This is the sketchyest code I have ever written. I feel ashamed. It does work though.
def parse_new(loaded_file):
	#print(loaded_file)
	cleaned = []
	for line in loaded_file:
		striped = line.strip().split("//")[0]
		if striped != "":
			cleaned.append(striped)

	level = 0
	group = {}
	depth = []
	ignore = False
	has_local = False
	get_local_defaults = False
	level_map = []

	for line in cleaned:
		if line.find("{") != -1:
			level += 1
			level_map.append(level)
		if line.find("}") != -1:
			level -= 1
			level_map.append(level)

		if line.count("function ") and not ignore:
			marker = group

			for foot in depth:
				marker = marker[foot]
			marker[line] = {}
			depth.append(line)
			print(line)

		if line.count("localContainer = "):
			marker = group
			for foot in depth:
				marker = marker[foot]
			print(line)

		if line.count("localContainer.") and line.count("= function") and not line.count("var"):
			marker = group
			for foot in depth:
				marker = marker[foot]
			local_name = line.split(" ")[0]
			print("->", local_name)
			marker[local_name] = []

		if get_local_defaults:
			marker = group
			for foot in depth:
				marker = marker[foot]
			#print(marker)
			marker[0].append(line)
			print("- - ->", line)

		if line.count("var local ="):
			get_local_defaults = True
			marker = group
			for foot in depth:
				marker = marker[foot]
			marker[local_name].append([])
			depth.append(local_name)


		if get_local_defaults and line.count("};"):
			get_local_defaults = False

		if line.count("local.") and line.count("= function"):
			marker = group
			for foot in depth:
				marker = marker[foot]
			marker.append(line)
			print("- ->", line)
			ignore = True

		if line.count("return local;"):
			ignore = False
			depth.pop()

		if line.count("return localContainer") and not line.count("="):
			depth.pop()
			print(line)

	# I don't think I need levels..
	print(level_map)

	return group

loaded = load_file("", "test_file.txt")
print(parse_new(loaded))
