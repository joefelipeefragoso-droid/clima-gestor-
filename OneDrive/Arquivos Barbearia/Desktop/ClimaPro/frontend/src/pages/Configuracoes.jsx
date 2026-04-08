import React, { useEffect, useState, useRef } from 'react';
import { BASE_URL } from '../services/api';
import configService from '../services/configService';
import { Save, Upload } from 'lucide-react';
import { flattenImage } from '../utils/imageUtils';

export default function Configuracoes() {
  const [config, setConfig] = useState({
    nome_empresa: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
    rodape_pdf: '',
    logo_url: ''
  });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    configService.get().then(res => {
      if (res.data) {
        setConfig(res.data);
        if (res.data.logo_url) {
          setPreview(`${BASE_URL}${res.data.logo_url}`);
        }
      }
    }).catch(err => {
      console.error('Erro ao carregar configurações:', err);
    });
  }, []);

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setConfig({ ...config, logoFile: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('nome_empresa', config.nome_empresa || '');
      formData.append('cnpj', config.cnpj || '');
      formData.append('telefone', config.telefone || '');
      formData.append('email', config.email || '');
      formData.append('endereco', config.endereco || '');
      formData.append('cidade', config.cidade || '');
      formData.append('rodape_pdf', config.rodape_pdf || '');
      
      if (config.logoFile) {
        // Garantir que a imagem seja processada se necessário ou enviada como Blob
        const processedBlob = await flattenImage(config.logoFile);
        formData.append('logo', processedBlob, 'logo.jpg');
      }

      await configService.update(formData);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
    setLoading(false);
  };

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Logo da Empresa</label>
            <div className="flex items-center gap-4">
              {preview ? (
                <img src={preview} alt="Pré-visualização da Logo" style={{ width: '100px', height: 'auto', borderRadius: '4px', border: '1px solid #ccc' }} />
              ) : (
                <div style={{ width: '100px', height: '100px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>Sem Logo</div>
              )}
              <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
              <button type="button" className="btn btn-outline" onClick={() => fileInputRef.current.click()}>
                <Upload size={16} /> Fazer Upload
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nome da Empresa</label>
            <input type="text" className="form-control" name="nome_empresa" value={config.nome_empresa || ''} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">CNPJ</label>
            <input type="text" className="form-control" name="cnpj" value={config.cnpj || ''} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Telefone</label>
            <input type="text" className="form-control" name="telefone" value={config.telefone || ''} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input type="email" className="form-control" name="email" value={config.email || ''} onChange={handleChange} />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Endereço</label>
            <input type="text" className="form-control" name="endereco" value={config.endereco || ''} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Cidade</label>
            <input type="text" className="form-control" name="cidade" value={config.cidade || ''} onChange={handleChange} />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Rodapé Padrão para PDF</label>
            <textarea className="form-control" name="rodape_pdf" value={config.rodape_pdf || ''} onChange={handleChange}></textarea>
          </div>
        </div>

        <div className="flex" style={{ justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={16} /> {loading ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </form>
    </div>
  );
}
