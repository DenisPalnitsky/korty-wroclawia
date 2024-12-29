import React from 'react';
import { useTranslation } from 'react-i18next';

const Disclaimer = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('Disclaimer')}</h1>
      <p>{t('disclaimer_content')}</p>
    </div>
  );
};

export default Disclaimer;
