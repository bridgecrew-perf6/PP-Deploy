const connexion = require('../../../db_connection');
const bcrypt = require("bcrypt");
const { sign } = require("jsonwebtoken");
const jwt = require("jsonwebtoken");

const mailgun = require("mailgun-js");
const DOMAIN = 'sandbox8cbfcafa2ff54adfabcbdba4ce193360.mailgun.org';
const mg = mailgun({ apiKey: process.env.MAILGUN_APIKEY, domain: DOMAIN })

const mailer = require('nodemailer');
const smtp = require('nodemailer-smtp-transport');



module.exports.createDemandeMaster = (req, res) => {

    if (req.file) {
        const file = "http://localhost:3000/demande-master/" + req.file.filename;
        const data = req.body;
        envoyerDemande('bilelhedhli@gmail.com',data.nomMaster);
        connexion.query(
            "INSERT INTO demande_master(date_inscrit, id_etat_demande_master, id_master, id_etudiant, fichier) VALUES (?,?,?,?,?)",
            [data.date_inscrit, data.id_etat_demande_master, data.id_master, data.id_etudiant, file],
            (err, results) => {
                if (err) {
                    res.status(500).json({
                        err: true,
                        message: err.sqlMessage,
                    });
                }

                if (results.affectedRows > 0)
                    res.status(200).json({
                        err: false,
                        results: results,
                    })
                else
                    res.status(404).json({
                        err: true,
                        results: [],
                        message: "echec lors du stockage",
                    })
            }
        )
    } else {
        res.status(404).json({
            err: true,
            message: "file non existe",
        })
    }
};

async function envoyerDemande(email,master) {
    const transport = mailer.createTransport(
        smtp({
            host: 'in.mailjet.com',
            port: 2525,
            auth: {
                user: process.env.API_KEY,
                pass: process.env.API_SECRET,
            },
        })
    );

    return json = await transport.sendMail({
      from: process.env.EMAIL,
      to: [email],
      subject: 'Confirmation d\inscription au master '+master,
      html: 'Bonjour,<br>'
      +"Merci cher utilisateur d'avoir postulé au master "+"<b>"+master+"</b>"
      +"<br> on vous contactera à chaque postulation"
      +'&nbsp;<br>'
      +'&nbsp;<br>'
      +'Cordialement,'

    });
  }

module.exports.getListDemandeMaster = (req, res) => {

    connexion.query(
        "SELECT *, etablissement.libelle as libelleEtablissement, master.nom as nomMaster,etat_demande_master.libelle as edmlibelle FROM demande_master, master,etat_demande_master, etudiant, etablissement,departement,user,adresse,bacclaureat,cursusgenerale WHERE demande_master.id_master = master.id_master and master.id_departement=departement.id_departement and master.id_etablissement=etablissement.id_etablissement and demande_master.id_etudiant = etudiant.id_etudiant and etudiant.id_user = user.id_user and bacclaureat.id_bacc  = etudiant.id_bacc and cursusgenerale.id_cursusgenerale = etudiant.id_cursusgenerale and adresse.id_user=user.id_user and etat_demande_master.id_etat_demande_master = demande_master.id_etat_demande_master",
        (errorr, results) => {
            if (errorr) {
                res.status(500).json({
                  errorr: true,
                    results: []
                });
            }

            if (results.length > 0)
                res.status(200).json({
                  errorr: false,
                    results: results,
                })
            else
                res.status(404).json({
                  errorr: false,
                    results: [],
                    message: "choix n'existe pas",
                })
        })
};

module.exports.getListDemandeByMaster = (req, res) => {
    const id_master = req.params.id;
    connexion.query(
        "SELECT *, etablissement.libelle as libelleEtablissement, master.nom as nomMaster,etat_demande_master.libelle as edmlibelle FROM demande_master, master,etat_demande_master, etudiant, etablissement,departement,user,adresse,bacclaureat,cursusgenerale WHERE demande_master.id_master = master.id_master and master.id_departement=departement.id_departement and cursusgenerale.etablissement=etablissement.id_etablissement and demande_master.id_etudiant = etudiant.id_etudiant and etudiant.id_user = user.id_user and bacclaureat.id_bacc  = etudiant.id_bacc and cursusgenerale.id_cursusgenerale = etudiant.id_cursusgenerale and adresse.id_user=user.id_user and etat_demande_master.id_etat_demande_master = demande_master.id_etat_demande_master and master.id_master = ?",
        [id_master],
        (er, results) => {
            if (er) {
                res.status(500).json({
                    er: true,
                    results: []
                });
            }

            if (results)
                res.status(200).json({
                    er: false,
                    results: results,
                })
            else
                res.status(404).json({
                    er: false,
                    results: [],
                    message: "choix n'existe pas",
                })
        })
}

module.exports.getDemandeMasterById = (req, res) => {
    const id_demande = req.params.id;
    connexion.query(
        "SELECT *, etablissement.libelle as libelleEtablissement, master.nom as nomMaster,etat_demande_master.libelle as edmlibelle FROM demande_master, master,etat_demande_master, etudiant, etablissement,departement,user,adresse WHERE demande_master.id_master = master.id_master and master.id_departement=departement.id_departement and master.id_etablissement=etablissement.id_etablissement and demande_master.id_etudiant = etudiant.id_etudiant and etudiant.id_user = user.id_user and adresse.id_user=user.id_user and etat_demande_master.id_etat_demande_master = demande_master.id_etat_demande_master AND demande_master.id_demande=?",
        [id_demande],
        (errr, results) => {

            if (errr) {
                res.status(500).json({
                  errr: true,
                    results: []
                });
            }

            if (results.length > 0)
                res.status(200).json({
                  errr: false,
                    results: results,
                })
            else
                res.status(404).json({
                  errr: false,
                    results: [],
                    message: "choix n'existe pas",
                })
        })
};

module.exports.ChangerEtatDemandeMaster = (req, res) => {


        const data = req.body;
        connexion.query(
            "UPDATE demande_master SET id_etat_demande_master=? WHERE id_demande =?",
            [ data.id_etat_demande_master, data.id_demande],
            (prb, results) => {
                if (prb) {
                    res.status(500).json({
                      prb: true,
                        results: []
                    });
                }

                if (results.affectedRows > 0)
                    res.status(200).json({
                      prb: false,
                        results: results.affectedRows,
                    })
                else
                    res.status(404).json({
                      prb: true,
                        results: [],
                        message: "echec lors du stockage",
                    })
            })


};


module.exports.addNoteDemande = (req, res) => {


  const data = req.body;
  connexion.query(
      "UPDATE demande_master SET note_entretien=? WHERE id_demande =?",
      [ data.note_entretien, data.id_demande],
      (pbl, results) => {
          if (pbl) {
              res.status(500).json({
                pbl: true,
                  results: []
              });
          }

          if (results.affectedRows > 0)
              res.status(200).json({
                pbl: false,
                  results: results.affectedRows,
              })
          else
              res.status(404).json({
                pbl: true,
                  results: [],
                  message: "echec lors du stockage",
              })
      })


};
module.exports.updateDemandeMaster = (req, res) => {
    if (req.file) {
        const file = "http://localhost:3000/demande-master/" + req.file.filename;
        const data = req.body;
        connexion.query(
            "UPDATE demande_master SET date_inscrit=?,id_etat_demande_master=?,id_master=?,id_etudiant=?,fichier=? WHERE id_demande =?",
            [data.date_inscrit, data.id_etat_demande_master, data.id_master, data.id_etudiant, file, data.id_demande],
            (pblm, results) => {
                if (pblm) {
                    res.status(500).json({
                      pblm: true,
                        results: []
                    });
                }

                if (results.affectedRows > 0)
                    res.status(200).json({
                      pblm: false,
                        results: results.affectedRows,
                    })
                else
                    res.status(404).json({
                      pblm: true,
                        results: [],
                        message: "echec lors du stockage",
                    })
            })

    } else {
        res.status(404).json({
          pblm: true,
            message: "file non existe",
        })
    }
};

module.exports.deleteDemandeMaster = (req, res) => {
    const id_demande = req.params.id;
    connexion.query(
        "DELETE FROM demande_master WHERE id_demande = ?",
        [id_demande],
        (erreur, results) => {
            if (erreur) {
                res.status(500).json({
                  erreur: true,
                    results: []
                });
            }

            if (results.affectedRows > 0)
                res.status(200).json({
                  erreur: false,
                    results: results.affectedRows,
                })
            else
                res.status(404).json({
                  erreur: true,
                    results: [],
                    message: "echec lors de suppression",
                })
        })
};

