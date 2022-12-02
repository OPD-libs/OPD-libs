import subprocess
import os
from pathlib import Path
import sys

base_path = Path(__file__).parent.parent.parent
docs_rel_path = 'docs-generator/typedoc'
metadata_lib_rel_path = 'libs/OPD-metadata-lib'
settings_lib_rel_path = 'libs/OPD-settings-lib'
utils_lib_rel_path = 'libs/OPD-utils-lib'
lib_rel_paths = [metadata_lib_rel_path, settings_lib_rel_path, utils_lib_rel_path]

for lib_rel_path in lib_rel_paths:
    print('--------------------------------')
    print('BUILDING -', lib_rel_path)
    print('--------------------------------')

    os.chdir(os.path.join(base_path, lib_rel_path))
    process = subprocess.check_call('npm run build', shell=True)
    print(process)


print('--------------------------------')
print('BUILDING - DOCS')
print('--------------------------------')

os.chdir(os.path.join(base_path, docs_rel_path))
process = subprocess.check_call('npm run build', shell=True)
print(process)

arguments = []
for i in range(1, len(sys.argv)):
    if sys.argv[i] == 'o':
        print('--------------------------------')
        print('OPENING DOCS')
        print('--------------------------------')
        url = os.path.join(base_path, "docs", "index.html")

        try:  # should work on Windows
            os.startfile(url)
        except AttributeError:
            try:  # should work on MacOS and most linux versions
                subprocess.call(['open', url])
            except:
                print('Could not open URL')
