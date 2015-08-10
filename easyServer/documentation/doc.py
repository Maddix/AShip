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
				# Special for single line comments
				if isComment:
					item = "//" + item
				if item.strip() == "//":
					isComment = True
				cleaned.append(item)

		if cleaned != []:
			parsed.extend(cleaned)

	return parsed

# parsed_file should be reversed at least when you call it from outside the function
# parent_objects should be a dict
def format_parsed_file(parsed_file):
	tree = {}

	bracket_pairs = []
	pair = []

	for index in range(len(parsed_file)):
		word = parsed_file[index]

		if word == "{":
			pair.append(index)
		elif word == "}":
			pair.append(index)

		if len(pair) == 2:
			bracket_pairs.append(pair)
			pair = []

	print(bracket_pairs)

	return tree

#print(format_parsed_file(parse_file(load_file("", "test_file.txt"), PAD_LIST).reverse()))
parsed = parse_file(load_file("", "test_file.txt"), PAD_LIST)
print(parsed)

formated = format_parsed_file(parsed)
print(formated)
