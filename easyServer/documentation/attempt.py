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


loaded = load_file("", "test_file.txt")

def find_parans(loaded_list):
	parans_indexs = []

	for item in loaded_list:



for item in loaded:
	print(item.strip())
