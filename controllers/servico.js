// Load required packages
var Servico = require('../models/servico');
//var multer  = require('multer');

// Create endpoint /api/servicos for POST
exports.postServico = function (req, res) {
  // Create a new instance of the Servico model
  var servico = new Servico();
  // Set the servico properties that came from the POST data
  servico.filename = req.body.filename;
  servico.endereco = req.body.endereco;
  servico.iduser = req.body.iduser;
  servico.lat = req.body.lat;
  servico.lng = req.body.lng;
  servico.status = req.body.status;
  servico.estado = req.body.estado;
  servico.cidade = req.body.cidade;
  servico.bairro = req.body.bairro;
  servico.desc = req.body.desc;
  servico.data = req.body.data;
  servico.rua = req.body.rua;

  // Save the servico and check for errors
  servico.save(function (err) {
    if (err)
      return res.send(err);
   return res.json({ message: 'postServicoSuccess'});
  });
};

exports.getListServicosLatlngCidade = function (req, res) {

  Servico.find({cidade: req.headers.cidade}).select('lat').select('lng').select('status').select('filename').select('desc').select('endereco').select('data').exec(function (err, servicos) {
    if (err)
       return res.send(err);
    if (servicos.length == 0)
       return res.json({ message: 'noservico' });

    return res.json({ message: 'success', servicos: servicos });

  });
};

exports.getListServicosLatlngUser = function (req, res) {

  Servico.find({iduser: req.headers.iduser}).select('lat').select('lng').select('status').select('filename').select('desc').select('endereco').select('data').exec(function (err, servicos) {
    if (err)
       return res.send(err);
    if (servicos.length == 0)
       return res.json({ message: 'noservico' });

    return res.json({ message: 'success', servicos: servicos });

  });
};

exports.getServicoById = function (req, res) {

  Servico.findById(req.params.idservico, {iduser:0}, function (err, servico) {
    if (err)
       return res.send(err);
     if (!servico)
       return res.json({ message: 'noservico' });;

    return res.json({ message: 'success', servico: servico });

  });
};

exports.getServico = function (req, res) {

  Servico.findById(req.headers.idservico, {iduser:0}, function (err, servico) {
    if (err)
       return res.send(err);
     if (!servico)
       return res.json({ message: 'noservico' });

    return res.json({ message: 'success', servico: servico });

  });
};
  
exports.getServicos = function (req, res) {

  Servico.find({ status: req.headers.status, iduser: req.headers.iduser},function (err, servicos) {
     if (err)
       return res.send(err);
     if (!servicos)
       return res.json({ message: 'noservico' });
     // Success
     return res.json({ message: 'success', servicos: servicos });
 
   });
};

exports.getImagem = function (req, res) {
  
  var options = {
    root: __dirname + '/../uploads/'
  };

  var fileName = req.params.imagename;
  res.sendFile(fileName, options, function (err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    
  });


};

//Edita descricao servico
exports.putServicoDescricao = function (req, res) {

  Servico.findById(req.body.idservico , function (err, servico) {
    if (err)
      return res.send(err);
    if (!servico)
      return res.json({ message: 'noservico' });

    //servico.email = req.body.email;//apenas em DEV, PRD não muda email
    servico.desc = req.body.desc;
    servico.save();

    res.json({ message: 'putServDescSuccess'});

  });

};

var fs = require('fs');
var gutil = require('gulp-util');



exports.deleteServico = function(req, res) {


  Servico.findById(req.headers.idservico , function (err, servico) {
    console.log();
    if (err)
      return res.send(err);
    if (!servico)
      return res.json({ message: 'noservico' });

    console.log(__dirname+'/../uploads');

    fs.exists(__dirname+'/../uploads/' + servico.filename, function(exists) {
      if(exists) {
 
        console.log(gutil.colors.green('File exists. Deleting now ...'));
        fs.unlink(__dirname+'/../uploads/'  + servico.filename);

        Servico.remove({_id: req.headers.idservico} , function(err) {
          if (err)
            return res.send(err);

          res.json({ message: 'deleteServicoSuccess' });
        });

      } else {
        //Show in red
        console.log(gutil.colors.red('File not found, so not deleting.'));
      }
    });

  });
  
  
};






