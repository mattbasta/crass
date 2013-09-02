from distutils.core import setup

setup(
    name='crass',
    version='0.1',
    description='CSS3 utility library',
    author='Matt Basta',
    author_email='me@mattbasta.com',
    url='https://github.com/mattbasta/crass',
    packages=['crass'],
    package_dir={'crass': 'python/lib'},
    install_requires=[p.strip() for p in open('./python/requirements.txt')],
    scripts=['python/bin/crass'],
)
