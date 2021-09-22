<?php

if (!preg_match('/^[\d\-]+$/', $_GET['file']))
{
	die("U trying to hack me, huh?");
}

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $_GET['file'] . '.csv"');

mb_internal_encoding('UTF-8');

$giorni = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì'];

echo "Nome;Giorno;Inizio Pari;Fine Pari;Inizio Dispari;Fine dispari;Patente\n";

$dati = unserialize(file_get_contents('orari-' . $_GET['file'] . '.serialize'));
foreach ($dati as $nome=>$dati)
{
	$dati['patente'] = $dati['patente'] ? 'Si' : 'No';

	foreach ($dati['fascia'] as $giornoNumero=>$fascia)
	{
		echo mb_convert_encoding(
			join(";", [
				$nome,
				$giorni[$giornoNumero],
				$fascia['pari']['inizio'],
				$fascia['pari']['fine'],
				$fascia['dispari']['inizio'],
				$fascia['dispari']['fine'],
				$dati['patente']
			]) . "\n", 
			'Windows-1252',
			'UTF-8'
		);
	}
}
