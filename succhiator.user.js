// ==UserScript==
// @name         Succhiator
// @namespace    https://github.com/isra00/succhiator
// @version      1.0
// @description  RMR
// @author       IVG
// @match        https://segreteria.unigre.it/framework/orariopers/orariopers.aspx
// @grant        none
// @run-at       document-end
// @updateURL    https://github.com/isra00/succhiator/raw/main/succhiator.user.js
// ==/UserScript==

(function() {
	'use strict';

document.Succhiator = {

	serverUrl: "http://10.0.0.99:8080/succhiator/ricevereOrari.php",

	regexpCellaCorso: /<b>\s*([\w\d]+)\s*<\/b><br>([^<]+)<br>/,

	modalitaCorsi: [],

	matricola: null,

	parseCorsi: function(iTabella)
	{
		var celle = document.querySelectorAll("#orario1sem table")[iTabella].querySelectorAll("td"),
			corsi = [], matches = [];

		for (i = 0; i < celle.length; i++)
		{
			matches = celle[i].innerHTML.match(this.regexpCellaCorso);
			if (matches)
			{
				corsi[matches[1]] = matches[2].trim();
				celle[i].setAttribute('data-corso', matches[1]);
			}
		}

		return corsi;
	},

	showPopupScegliereModalita: function(iTabella)
	{
		var corsi, tblCorsiHtml = "", i;

		var css = `
.popup { display: block; position: fixed; padding: 10px; width: 40em; right: 5%; margin-left: -150px; height: auto; top: 20%; margin-top: -100px; background: #FFF; z-index: 20; font-family: sans-serif; box-shadow: 0 0 10px gray; }
.popup:after { position: fixed; content: ''; top: 0; left: 0; bottom: 0; right: 0; background: rgba(0,0,0,0.2); z-index: -2; }
.popup:before { position: absolute; content: ''; top: 0; left: 0; bottom: 0; right: 0; background: #FFF; z-index: -1; }
.popup h1 { font-size: 1.4em; text-align: center; }
.pseudoboton { border-radius: .2em; border: 1px solid silver; padding: .05em .1em; }
.succhiatorTable { border: 1px solid silver; border-collapse: collapse; margin: 0 auto;}
.succhiatorTable td, .succhiatorTable th { border: 1px solid silver; padding: .4em; }
.succhiatorTable th { text-align: right; vertical-align: middle; }
.succhiatorTable td { text-align: left; }
.ora { width: 3em; font-size: 1.1em; }
.radio { width: auto; margin-left: 1em; }
.patente { font-size: 1.2em; }

.popup button { background: #d32f2f; color: white; padding: .3em .5em; text-shadow: 1px 1px 1px gray; border-radius: .2em; border: none; box-shadow: 1px 1px 5px silver; margin-left: .5em; display: inline-block; cursor: pointer; font-size: 1.3em; }
.popup button:hover { box-shadow: 1px 1px 10px gray; }

#formModalitaCorsi button { background: silver; }
#formModalitaCorsi:valid button { background: #00B050; }

.succhiatorTable.modalitaCorsi { font-size: .9em; }
.succhiatorTable.modalitaCorsi th { max-width: 15em; overflow: hidden; text-align: left; }
.succhiatorTable.modalitaCorsi h4 { margin: 0; }
.succhiatorTable.modalitaCorsi small { color: gray; }
.grigio { color: gray; }
th.center { text-align: center; }
`;
		var styleSheet = document.createElement("style");
		styleSheet.type = "text/css";
		styleSheet.innerText = css;
		document.head.appendChild(styleSheet);

		var htmlPopup = `
<div class="popup" id="popup">
	<h1>Sceglie la modalità dei corsi</h1>

	<form style="text-align: center" name="formModalitaCorsi" id="formModalitaCorsi">
		<table class="succhiatorTable modalitaCorsi" id="tblModalitaCorsi"></table>
		<p><button type="button" onclick="document.Succhiator.confermareModalita(%)" class="grigio">Avanti</button></p>
	</form>
</div>
`;
		htmlPopup = htmlPopup.replace("%", iTabella);
		document.getElementsByTagName("body")[0].innerHTML = htmlPopup + document.getElementsByTagName("body")[0].innerHTML;

		corsi = this.parseCorsi(iTabella);

		tblCorsiHtml = "<tbody>";

		for (i in corsi)
		{
			tblCorsiHtml += "<tr><th><h4>" + i + "</h4><small>" + corsi[i].substr(0, 30) + "</small></th>";
			tblCorsiHtml += '<td><select name="' + i + '" id="' + i + '">';
			//tblCorsiHtml += `<option class="grigio" hidden disabled selected value>Scegli modalità ⇩</option>`
			tblCorsiHtml += `<option value="presenza">In presenza sempre</option>`;
			tblCorsiHtml += `<option value="alternanza">In presenza alternata</option>`;
			tblCorsiHtml += `<option value="online">On-Line sempre</option></select></td></tr>`;
		}

		tblCorsiHtml += "</tbody>";

		document.getElementById("tblModalitaCorsi").innerHTML = tblCorsiHtml;
	},

	confermareModalita: function(iTabella)
	{
		var selects = document.querySelectorAll("#formModalitaCorsi select"),
			i;

		for (i in selects)
		{
			this.modalitaCorsi[selects[i].id] = selects[i].value;
		}

		this.succhiareOrario(iTabella);

		return false;
	},

	parseOrario: function(iTabella)
	{
		var celle = document.querySelectorAll("#orario1sem table")[iTabella].querySelectorAll("td"),
			oreNaturali, ora, giorno, sezione, i = 0, j, totaleGiorni = 5, modalitaCorso,
			fascie = {"pari": [{}, {}, {}, {}, {}], "dispari": [{}, {}, {}, {}, {}]},
			tippiSettimane = ["pari", "dispari"];

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

		for (j in tippiSettimane)
		{
			for (i = 0; i < celle.length; i++)
			{
				if (celle[i].innerHTML.length > 1)
				{
					celle[i].style.background = "pink";

					giorno	= i % (totaleGiorni);
					ora		= Math.floor(i / totaleGiorni);

					modalitaCorso = this.modalitaCorsi[celle[i].getAttribute('data-corso')];

					// Si conta la ora se il corso è sempre in presenza o, se in alternanza, la parità
					// della settimana (primo bucle, tippiSettimane) coincide con la parità della matricola
					if (
						"presenza" == modalitaCorso
						|| ("alternanza" == modalitaCorso && (j % 2 == this.matricola % 2))
					)
					{
						if (!("inizio" in fascie[tippiSettimane[j]][giorno]))
						{
							fascie[tippiSettimane[j]][giorno].inizio = oreNaturali[ora].inizio;
						}

						fascie[tippiSettimane[j]][giorno].fine = oreNaturali[ora].fine;
					}
				}
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
		var htmlPopup = `
	<h1>Modifica il tuo orario (se necessario) <br>e clicca su <span class="pseudoboton">Confermare</span></h1>

	<form style="text-align: center" method="POST" accept-charset="utf-8" id="succhiator-form">

		<table class="succhiatorTable">
			<tr>
				<th>Nome</th>
				<td><input name="pu-nome" id="pu-nome"></td>
			</tr>
			<tr>
				<th>Semestre</th>
				<td><input name="pu-semestre" id="pu-semestre"></td>
			</tr>
			<tr><th colspan="2" class="center">Settimane pari</th></tr>
			<tr>
				<th>Lunedì</th>
				<td>Dalle <input class="ora"  id="pu-inizio-pari-0" name="fascia[0][pari][inizio]" pattern="(8:30|9:30|10:30|11:30|15:00|16:00|17:00|18:00)"> alle <input class="ora" name="fascia[0][pari][fine]" id="pu-fine-pari-0" pattern="(9:15|10:15|11:15|12:15|15:45|16:45|17:45|18:45)"></td>
			</tr>
			<tr>
				<th>Martedì</th>
				<td>Dalle <input class="ora"  id="pu-inizio-pari-1" name="fascia[1][pari][inizio]" pattern="(8:30|9:30|10:30|11:30|15:00|16:00|17:00|18:00)"> alle <input class="ora" name="fascia[1][pari][fine]" id="pu-fine-pari-1" pattern="(9:15|10:15|11:15|12:15|15:45|16:45|17:45|18:45)"></td>
			</tr>
			<tr>
				<th>Mercoledì</th>
				<td>Dalle <input class="ora"  id="pu-inizio-pari-2" name="fascia[2][pari][inizio]" pattern="(8:30|9:30|10:30|11:30|15:00|16:00|17:00|18:00)"> alle <input class="ora" name="fascia[2][pari][fine]" id="pu-fine-pari-2" pattern="(9:15|10:15|11:15|12:15|15:45|16:45|17:45|18:45)"></td>
			</tr>
			<tr>
				<th>Giovedì</th>
				<td>Dalle <input class="ora"  id="pu-inizio-pari-3" name="fascia[3][pari][inizio]" pattern="(8:30|9:30|10:30|11:30|15:00|16:00|17:00|18:00)"> alle <input class="ora" name="fascia[3][pari][fine]" id="pu-fine-pari-3" pattern="(9:15|10:15|11:15|12:15|15:45|16:45|17:45|18:45)"></td>
			</tr>
			<tr>
				<th>Venerdì</th>
				<td>Dalle <input class="ora"  id="pu-inizio-pari-4" name="fascia[4][pari][inizio]" pattern="(8:30|9:30|10:30|11:30|15:00|16:00|17:00|18:00)"> alle <input class="ora" name="fascia[4][pari][fine]" id="pu-fine-pari-4" pattern="(9:15|10:15|11:15|12:15|15:45|16:45|17:45|18:45)"></td>
			</tr>
			<tr><th colspan="2" class="center">Settimane dispari</th></tr>
			<tr>
				<th>Lunedì</th>
				<td>Dalle <input class="ora"  id="pu-inizio-dispari-0" name="fascia[0][dispari][inizio]" pattern="(8:30|9:30|10:30|11:30|15:00|16:00|17:00|18:00)"> alle <input class="ora" name="fascia[0][dispari][fine]" id="pu-fine-dispari-0" pattern="(9:15|10:15|11:15|12:15|15:45|16:45|17:45|18:45)"></td>
			</tr>
			<tr>
				<th>Martedì</th>
				<td>Dalle <input class="ora"  id="pu-inizio-dispari-1" name="fascia[1][dispari][inizio]" pattern="(8:30|9:30|10:30|11:30|15:00|16:00|17:00|18:00)"> alle <input class="ora" name="fascia[1][dispari][fine]" id="pu-fine-dispari-1" pattern="(9:15|10:15|11:15|12:15|15:45|16:45|17:45|18:45)"></td>
			</tr>
			<tr>
				<th>Mercoledì</th>
				<td>Dalle <input class="ora"  id="pu-inizio-dispari-2" name="fascia[2][dispari][inizio]" pattern="(8:30|9:30|10:30|11:30|15:00|16:00|17:00|18:00)"> alle <input class="ora" name="fascia[2][dispari][fine]" id="pu-fine-dispari-2" pattern="(9:15|10:15|11:15|12:15|15:45|16:45|17:45|18:45)"></td>
			</tr>
			<tr>
				<th>Giovedì</th>
				<td>Dalle <input class="ora"  id="pu-inizio-dispari-3" name="fascia[3][dispari][inizio]" pattern="(8:30|9:30|10:30|11:30|15:00|16:00|17:00|18:00)"> alle <input class="ora" name="fascia[3][dispari][fine]" id="pu-fine-dispari-3" pattern="(9:15|10:15|11:15|12:15|15:45|16:45|17:45|18:45)"></td>
			</tr>
			<tr>
				<th>Venerdì</th>
				<td>Dalle <input class="ora"  id="pu-inizio-dispari-4" name="fascia[4][dispari][inizio]" pattern="(8:30|9:30|10:30|11:30|15:00|16:00|17:00|18:00)"> alle <input class="ora" name="fascia[4][dispari][fine]" id="pu-fine-dispari-4" pattern="(9:15|10:15|11:15|12:15|15:45|16:45|17:45|18:45)"></td>
			</tr>
		</table>

		<p class="patente">
			Ho patente valida:
			<input class="radio" type="radio" name="patente" id="si" value="true"><label for="si">Sì</label>
			<input class="radio" type="radio" name="patente" id="no" value="false" checked="checked"><label for="no">No</label>
		</p>

		<p><button type="submit">Confermare</button></p>

	</form>
`;
		document.getElementById("popup").innerHTML = htmlPopup;
		document.getElementById("succhiator-form").action = document.Succhiator.serverUrl;
	},

	succhiareOrario: function(iTabella)
	{
		var datiStudente = document.querySelectorAll("#GridView1 td"),
			nomeStudente = datiStudente[2].innerText + " " + datiStudente[1].innerText,
			fascie, i, j;

		this.matricola	 = parseInt(datiStudente[0].innerText);
		fascie 			 = document.Succhiator.parseOrario(iTabella);

		this.mostrarePopup();

		document.getElementById("pu-nome").value = this.titleCase(nomeStudente);
		document.getElementById("pu-semestre").value = iTabella + 1;

		for (j in fascie)
		{
			for (i = 0; i < fascie[j].length; i++)
			{
				if (typeof fascie[j][i].inizio !== 'undefined') 	document.getElementById("pu-inizio-" + j + "-" + i).value	= fascie[j][i].inizio;
				if (typeof fascie[j][i].fine !== 'undefined') 		document.getElementById("pu-fine-" + j + "-" + i).value	= fascie[j][i].fine;
			}
		}
	}
};

var semestres, i;

semestres = document.getElementById("orario1sem").getElementsByTagName("h1");

for (i = 0; i < semestres.length; i++)
{
	semestres[i].getElementsByTagName("p")[0].innerHTML += "<button onclick='document.Succhiator.showPopupScegliereModalita(" + i + ")' style='background: #d32f2f; color: white; padding: .2em .4em; text-shadow: 1px 1px 1px gray; border-radius: .2em; border: none; box-shadow: 1px 1px 5px silver; margin-left: .5em; display: inline-block; cursor: pointer; font-size: 1em'>Inviare a gruppo liste</button>";
}

})();