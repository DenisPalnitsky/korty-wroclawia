import React from 'react';
import { useTranslation } from 'react-i18next';

const Disclaimer = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('Disclaimer')}</h1>
      <p>{t('This is a disclaimer page. The content of this page is translated using i18n.')}</p>
    </div>
  );
};

export default Disclaimer;
