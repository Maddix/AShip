#! /usr/bin/python3

import sys

# Still a work in progress

def load_file(path, filename, operation="r"):
	file = []
	with open(path + filename, operation) as open_file:
		file = open_file.readlines()
	return file

def find_all(string, find, start=0):
	found = string.find(find, start)
	if found != -1:
		return [found] + [item for item in find_all(string, find, found+1)]
	return []

def parser(string_file, total_open=0):
	index = string_file.find("{")
	index_cls = string_file.find("}")
	con = {}

	# While total_open isn't 0 keep searching for new braces.

	if index != -1 and index < index_cls:
		con[string_file[:index]] = parser(string_file[index+1:], total_open+1)
	else:
		con = string_file[:index_cls]
	return con

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
	#has_local = False
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
			#print(line)

		if line.count("localContainer = "):
			marker = group
			for foot in depth:
				marker = marker[foot]
			#print(line)

		if line.count("localContainer.") and line.count("= function") and not line.count("var"):
			marker = group
			for foot in depth:
				marker = marker[foot]
			local_name = line.split(" ")[0]
			print("->", local_name)
			marker[local_name] = []

		#if line.count(".extend") and line.count("config"):
		#	marker = group
		#	for foot in depth:
		#		marker = marker[foot]
		#	marker[0].append(line)
		#	print("- ->", line)

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

def try_two(raw_file):

	striped_file = filter(lambda x: x.strip() != "", raw_file)

	for item in striped_file:
		print(item)

loaded = load_file("", "test_file.txt")
#print(try_two(loaded))
#print(parse_new(loaded))

string = ""

for line in loaded:
		striped = line.strip().split("//")[0]
		if striped != "":
			string += " " + striped

print(parser(string))
