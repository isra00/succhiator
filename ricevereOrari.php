<?php

if (!$_POST['pu-semestre'])
{
	http_response_code(400);
	die("<h1>400 Bad request</h1>Questo script deve ricevere dati POST.");
}

$_POST['pu-semestre'] = intval($_POST['pu-semestre']);

//Abbiamo un file diverso per ogni anno e semestre
$filename = 'orari-' . date('Y') . '-' . $_POST['pu-semestre'] . '.serialize';

$dati = [];

if (file_exists($filename))
{
	$dati = unserialize(file_get_contents($filename));
}

$dati[$_POST['pu-nome']] = [
	'patente' => $_POST['patente'],
	'fascia' => $_POST['fascia']
];

file_put_contents($filename, serialize($dati));

echo "<h1>Grazie, abbiamo ricevuto il tuo orario.</h1>";