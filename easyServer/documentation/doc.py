#! /usr/bin/python3

import sys

def loadFile(path, filename, operation="r"):
	file = []
	with open(path + filename, operation) as open_file:
		file = open_file.readlines()
	return file


def find(line, text):
	if line.find(text) != -1:
		return True

known_functions = {}

complete = []


for line in loadFile("", "test_file.txt"):
	cleaned = []

	replace_list = ["(", ")", ",", ".", ":", "{", "}", "[", "]", "=", "+", "-", ";", "//", "/*", "*/"]

	clean = line.strip().strip("\n")

	for item in replace_list:
		clean = clean.replace(item, " " + item + " ")

	clean = clean.split(" ")

	for item in clean:
		if item is not "":
			cleaned.append(item)

	if cleaned != []:
		complete.extend(cleaned)

print(complete)



