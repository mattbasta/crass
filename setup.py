from distutils.core import setup

setup(
    name='crass',
    version='0.1',
    description='CSS3 utility library',
    author='Matt Basta',
    author_email='me@mattbasta.com',
    url='https://github.com/mattbasta/crass',
    packages=['crass'],
    package_dir={'crass': 'lib'},
    scripts=['bin/crass'],
)