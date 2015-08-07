#! /usr/bin/python3

import sys

def loadFile(path, filename, operation="r"):
	file = []
	with open(path + filename, operation) as open_file:
		file = open_file.readlines()
	return file


def find_in_line(line, text):
	if line.find(text) != -1:
		return True

def get_functions(line):
	funcs = {}
	if find_in_line(line, "function "):
		name = line[:line.find("(")].strip().split(" ")[-1]
		params = get_func_params(line)
		funcs[name] = params
	elif find_in_line(line, " function"):
		split = line.split("=")
		name = split[0].split(".")[1]
		params = get_func_params(split[1])
		funcs[name] = params

		return funcs
	return False

def get_func_params(line):
	""" Return found parameters """
	first_paren = line.find("(")
	second_paren = line.rfind(")")
	if first_paren != -1 or second_paren != -1:
		return [param.strip() for param in line[first_paren + 1 : second_paren].split(",")]
	else:
		return False


for line in loadFile("", "test_file.txt"):
	print(line.strip("\n").strip("\t").strip("//"))
