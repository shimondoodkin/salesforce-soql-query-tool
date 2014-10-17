<?php
 $files = scandir("./icons"); //get the list of files
  $files = array_diff($files,array(".","..")); //remove directories
  foreach ($files as $key => $file) {
  $name = preg_replace('/\.[a-z]{3}$/i','',$file); //remove extension
  $name = preg_replace('/[^\w\d]|_/','-',$name); //replace weird characters with dash
  echo ".ui-icon-silk-$name  { background-position: 0 0; background-image:url(images/$file) !important;}\n"; //output the rule
 }
?>