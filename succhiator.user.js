// ==UserScript==
// @name         Succhiator
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  RMR
// @author       IVG
// @match        https://segreteria.unigre.it/framework/orariopers/orariopers.aspx
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

document.Succhiator = {
	parseOrario: function(iTabella)
	{
		var celle = document.querySelectorAll("#orario1sem table")[iTabella].querySelectorAll("td"),
			oreNaturali, fascie, ora, giorno, sezione, i = 0, totaleGiorni = 5;

		oreNaturali = [
			{"inizio": "8:30", "fine": "9:15"},
			{"inizio": "9:30", "fine": "10:15"},
			{"inizio": "10:30", "fine": "11:15"},
			{"inizio": "11:30", "fine": "12:15"},
			{"inizio": "15:00", "fine": "15:45"},
			{"inizio": "16:00", "fine": "16:45"},
			{"inizio": "17:00", "fine": "17:45"},
			{"inizio": "18:00", "fine": "18:45"}
		];

		fascie = [{}, {}, {}, {}, {}];


		for (i = 0; i < celle.length; i++)
		{
			if (celle[i].innerHTML.length > 1)
			{
				giorno	= i % (totaleGiorni);
				ora		= Math.floor(i / totaleGiorni);

				celle[i].style.background = "pink";


				if (!("inizio" in fascie[giorno]))
				{
					fascie[giorno].inizio = oreNaturali[ora].inizio;
				}

				fascie[giorno].fine = oreNaturali[ora].fine;
			}
		}

		return fascie;
	},

	//@see https://stackoverflow.com/questions/32589197/how-can-i-capitalize-the-first-letter-of-each-word-in-a-string-using-javascript
	titleCase: function(str) {
		var splitStr = str.toLowerCase().split(' ');
		for (var i = 0; i < splitStr.length; i++) {
			splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
		}
		return splitStr.join(' ');
	},

	mostrarePopup: function()
	{
		var css = `
.popup { display: block; position: fixed; padding: 10px; width: 30em; right: 5%; margin-left: -150px; height: auto; top: 20%; margin-top: -100px; background: #FFF; z-index: 20; font-family: sans-serif; }
.popup:after { position: fixed; content: ''; top: 0; left: 0; bottom: 0; right: 0; background: rgba(0,0,0,0.2); z-index: -2; }
.popup:before { position: absolute; content: ''; top: 0; left: 0; bottom: 0; right: 0; background: #FFF; z-index: -1; }
.popup h1 { font-size: 1.4em; text-align: center; }
.pseudoboton { border-radius: .2em; border: 1px solid silver; padding: .05em .1em; }
.succhiatorTable { border: 1px solid silver; border-collapse: collapse; margin: 0 auto;}
.succhiatorTable td, .succhiatorTable th { border: 1px solid silver; padding: .4em; }
.succhiatorTable th { text-align: right; }
.succhiatorTable td { text-align: left; }
.ora { width: 3em; font-size: 1.1em; }
.radio { width: auto; margin-left: 1em; }
.patente { font-size: 1.2em; }

.popup button { background: #d32f2f; color: white; padding: .3em .5em; text-shadow: 1px 1px 1px gray; border-radius: .2em; border: none; box-shadow: 1px 1px 5px silver; margin-left: .5em; display: inline-block; cursor: pointer; font-size: 1.3em; }
`;
		var styleSheet = document.createElement("style");
		styleSheet.type = "text/css";
		styleSheet.innerText = css;
		document.head.appendChild(styleSheet);

		var htmlPopup = `
<div class="popup">
	<h1>Edita il tuo orario (se necessario) <br>e clicca su <span class="pseudoboton">Confermare</span></h1>

	<form style="text-align: center" method="POST" accept-charset="utf-8" action="http://localhost/succhiator/ricevereOrari.php">

		<table class="succhiatorTable">
			<tr>
				<th>Nome</th>
				<td><input name="pu-nome" id="pu-nome"></td>
			</tr>
			<tr>
				<th>Semestre</th>
				<td><input name="pu-semestre" id="pu-semestre"></td>
			</tr>
			<tr>
				<th>Lunedì</th>
				<td>Dalle <input class="ora"  id="pu-inizio-0" name="fascia[0][inizio]" pattern="(8:30|9:30|10:30|11:30|15:00|16:00|17:00|18:00)"> alle <input class="ora" name="fascia[0][fine]" id="pu-fine-0" pattern="(9:15|10:15|11:15|12:15|15:45|16:45|17:45|18:45)"></td>
			</tr>
			<tr>
				<th>Martedì</th>
				<td>Dalle <input class="ora"  id="pu-inizio-1" name="fascia[1][inizio]" pattern="(8:30|9:30|10:30|11:30|15:00|16:00|17:00|18:00)"> alle <input class="ora" name="fascia[1][fine]" id="pu-fine-1" pattern="(9:15|10:15|11:15|12:15|15:45|16:45|17:45|18:45)"></td>
			</tr>
			<tr>
				<th>Mercoledì</th>
				<td>Dalle <input class="ora"  id="pu-inizio-2" name="fascia[2][inizio]" pattern="(8:30|9:30|10:30|11:30|15:00|16:00|17:00|18:00)"> alle <input class="ora" name="fascia[2][fine]" id="pu-fine-2" pattern="(9:15|10:15|11:15|12:15|15:45|16:45|17:45|18:45)"></td>
			</tr>
			<tr>
				<th>Giovedì</th>
				<td>Dalle <input class="ora"  id="pu-inizio-3" name="fascia[3][inizio]" pattern="(8:30|9:30|10:30|11:30|15:00|16:00|17:00|18:00)"> alle <input class="ora" name="fascia[3][fine]" id="pu-fine-3" pattern="(9:15|10:15|11:15|12:15|15:45|16:45|17:45|18:45)"></td>
			</tr>
			<tr>
				<th>Venerdì</th>
				<td>Dalle <input class="ora"  id="pu-inizio-4" name="fascia[4][inizio]" pattern="(8:30|9:30|10:30|11:30|15:00|16:00|17:00|18:00)"> alle <input class="ora" name="fascia[4][fine]" id="pu-fine-4" pattern="(9:15|10:15|11:15|12:15|15:45|16:45|17:45|18:45)"></td>
			</tr>
		</table>

		<p class="patente">
			Ho patente valida:
			<input class="radio" type="radio" name="patente" id="si" value="true"><label for="si">Sì</label>
			<input class="radio" type="radio" name="patente" id="no" value="false" checked="checked"><label for="no">No</label>
		</p>

		<p><button type="submit">Confermare</button></p>

	</form>
</div>
`;
		document.getElementsByTagName("body")[0].innerHTML = htmlPopup + document.getElementsByTagName("body")[0].innerHTML;
	},

	succhiareOrario: function(iTabella)
	{
		var datiStudente = document.querySelectorAll("#GridView1 td"),
			nomeStudente = datiStudente[2].innerText + " " + datiStudente[1].innerText,
			fascie = document.Succhiator.parseOrario(iTabella),
			i;

		this.mostrarePopup();

        document.getElementById("pu-nome").value = this.titleCase(nomeStudente);
		document.getElementById("pu-semestre").value = iTabella + 1;

		for (i = 0; i < fascie.length; i++)
		{
            if (typeof fascie[i].inizio !== 'undefined') 	document.getElementById("pu-inizio-" + i).value	= fascie[i].inizio;
            if (typeof fascie[i].fine !== 'undefined') 		document.getElementById("pu-fine-" + i).value	= fascie[i].fine;
		}
	}
};

var semestres, i;

semestres = document.getElementById("orario1sem").getElementsByTagName("h1");

for (i = 0; i < semestres.length; i++)
{
    semestres[i].getElementsByTagName("p")[0].innerHTML += "<button onclick='document.Succhiator.succhiareOrario(" + i + ")' style='background: #d32f2f; color: white; padding: .2em .4em; text-shadow: 1px 1px 1px gray; border-radius: .2em; border: none; box-shadow: 1px 1px 5px silver; margin-left: .5em; display: inline-block; cursor: pointer; font-size: 1em'>Inviare a gruppo liste</button>";
}

})();