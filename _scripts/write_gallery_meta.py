import argparse
import logging
from pathlib import Path

from iptcinfo3 import IPTCInfo

iptcinfo_logger = logging.getLogger('iptcinfo')
iptcinfo_logger.setLevel(logging.ERROR)


def main(directory):
    paths = Path(directory).glob('**/*.jpg')

    print('Inventory:')

    for path in paths:
        info = IPTCInfo(path)
        date_created = info['date created'].decode('utf-8')
        time_created = info['time created'].decode('utf-8')

        if info['object name']:
            title = info['object name'].decode('utf-8')
        else:
            title = ''

        data_created_formatted = f'{date_created[0:4]}-{date_created[4:6]}-{date_created[6:8]}'
        time_created_formatted = f'{time_created[0:2]}:{time_created[2:4]}:{time_created[4:6]}Z'

        print(f'- filename: {path.name}')
        print(f'  date: {data_created_formatted}T{time_created_formatted}')
        print(f'  title: {title}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--path', required=True)

    args = parser.parse_args()

    main(args.path)
