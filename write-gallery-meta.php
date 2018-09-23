<?php
error_reporting(E_ALL & ~E_NOTICE & ~E_STRICT & ~E_DEPRECATED);

$options = getopt('', ['path:']);

if (PHP_SAPI != "cli") {
  exit;
}

if (!isset($options['path'])) {
  exit;
}

if (!is_dir($options['path'])) {
  exit;
}

$inventory = '';

$path = $options['path'];

if (substr($options['path'], -1) != '/') {
  $path = $options['path'] . '/';
}

$dir = new DirectoryIterator($path);

foreach ($dir as $fileinfo) {
  if (!$fileinfo->isDot() && $fileinfo->isFile() && substr($fileinfo->getBasename(), 0, 1) !== '.') {
    $caption = '';
    $title = '';
    $dateCreated = '';
    $timeCreated = '';

    $image = getimagesize($path . $fileinfo->getFilename(), $info);
    if (isset($info['APP13'])) {
      if ($iptc = iptcparse($info['APP13'])) {
        $caption = $iptc["2#120"][0];
        $title = $iptc["2#005"][0];
        $dateCreated = substr_replace(substr_replace($iptc["2#055"][0], "-", 4, 0), "-", 7, 0);
        $timeCreated = substr_replace(substr_replace($iptc["2#060"][0], ":", 2, 0), ":", 5, 0);

        $inventory .= '- filename: ' . $fileinfo->getFilename() . PHP_EOL;

        if (!empty($dateCreated) && !empty($timeCreated)) {
          $inventory .= '  date: ' . $dateCreated . 'T' . $timeCreated . 'Z' . PHP_EOL;
        }

        if (!empty($title)) {
          $inventory .= '  title: ' . $title . PHP_EOL;
        }

        if (!empty($caption)) {
          $inventory .= '  caption: ' . $caption . PHP_EOL;
        }

        echo 'Added Image: ' . $fileinfo->getFilename() . PHP_EOL;
      } else {
        echo 'Invalid IPTC Data: ' . $fileinfo->getFilename() . PHP_EOL;
      }
    } else {
      echo 'No IPTC Data: ' . $fileinfo->getFilename() . PHP_EOL;
    }
  }
}

echo PHP_EOL . 'Inventory:' . PHP_EOL . $inventory;
