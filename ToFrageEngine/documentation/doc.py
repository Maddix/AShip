#! /usr/bin/python3

# Still a work in progress

def load_file(path, filename, operation="r"):
	file = []
	with open(path + filename, operation) as open_file:
		file = open_file.readlines()
	return file

def has(line, items):
	return [line.index(item) if item in line else -1 for item in items]


def isNamedFunction(line):
	indexs = has(line, ["function", "(", ")"])
	if not -1 in indexs:
		name = line[indexs[0]+len("function"):indexs[1]].strip()
		if name == "":
			return False
		params = line[indexs[1]:indexs[2]].split(",")
		return (name, params)
	return False

def isGroupFunction(line, group_name):
	indexs = has(line, [group_name, "function", "=", "(", ")", "{"])
	if not -1 in indexs:
		name = line[indexs[0]+len(group_name)+1:indexs[2]].strip()
		params = line[indexs[3]+1:indexs[4]].split(",")
		return (name, params)
	return False

def parse(lines, container=False):
	line = lines.pop(0).strip()

	named = isNamedFunction(line)
	if named:
		return named
	group = isGroupFunction(line, "localConainer")
	sub = isGroupFunction(line, "local")
	if group:
		return group
	elif sub:
		return sub


lines = load_file("", "test_file.txt")

count = 0
while lines != [] or count == 300:
	result = parse(lines)
	if result:
		print(count, ":", result)
	count += 1


