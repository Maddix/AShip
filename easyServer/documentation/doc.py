#! /usr/bin/python3

import sys

PAD_LIST = ["(", ")", ",", ".", ":", "{", "}", "[", "]", "=", "+", "-", ";", "//", "/*", "*/"]

def find(line, text):
	if line.find(text) != -1:
		return True

def load_file(path, filename, operation="r"):
	file = []
	with open(path + filename, operation) as open_file:
		file = open_file.readlines()
	return file

def parse_file(loaded_file, pad_list):
	parsed = []

	for line in loaded_file:
		clean = line.strip().strip("\n")
		cleaned = []

		for item in pad_list:
			clean = clean.replace(item, " " + item + " ") # Should I use str.format here?

		clean = clean.split(" ")
		# Keep track if we pass the single line comment syntax
		isComment = False
		for item in clean:
			if item is not "":
				if item.strip() == "//":
					isComment = True
				if not isComment:
					cleaned.append(item)

		if cleaned != []:
			parsed.extend(cleaned)

	return parsed


def make_thought(lines):
	pass

def parse_new(loaded_file):
	#print(loaded_file)
	thought = {
		"head": "",
		"parameters": [],
		"body": {}
	}



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
			t = line.split(" ")[0]
			print("->", t)
			marker[t] = []

		if get_local_defaults:
			marker = group
			for foot in depth:
				marker = marker[foot]
			#print(marker)
			marker.append(line)
			print("- - ->", line)

		if line.count("var local ="):
			get_local_defaults = True
			marker = group
			for foot in depth:
				marker = marker[foot]
			marker["defaults"] = []
			depth.append(t)

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

	print(group)
	print(level_map)


# parsed_file should be reversed at least when you call it from outside the function
# parent_objects should be a dict
def format_parsed_file(parsed_file):

	for word in parsed_file:
		print(word)


#print(format_parsed_file(parse_file(load_file("", "test_file.txt"), PAD_LIST).reverse()))
loaded = load_file("", "test_file.txt")
parsed = parse_file(loaded, PAD_LIST)
#print(parsed)


#formated = format_parsed_file(parsed)
#print(formated)

parse_new(loaded)
