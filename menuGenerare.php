<h1>Generare CSV con orari raccolti</h1>
<p>Sceglie anno e semestre:</p>
<p>
<?php

$files = scandir(".");
foreach ($files as $file)
{
	if ('orari-' == substr($file, 0, 6))
	{
		echo '<a href="generareCsv.php?file=' . substr($file, 6, 6) . '">' . substr($file, 6, 6) . '</a><br>';
	}
}
